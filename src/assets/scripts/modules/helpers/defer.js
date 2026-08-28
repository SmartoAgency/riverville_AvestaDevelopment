// Спільні примітиви відкладення роботи. Раніше жили лише в home.js — винесені
// сюди, щоб решта сторінок користувалась тими самими правилами (ТЗ 3.5.2.2).

// Виконує callback після того, як браузер намалював кадр.
// requestAnimationFrame спрацьовує ПЕРЕД відмальовуванням, тому самого rAF
// (і навіть подвійного) недостатньо — робота лишиться в критичному кадрі.
// setTimeout усередині rAF стає в чергу задач і виконається вже після паінту.
// Зовнішній setTimeout — підстраховка для фонових вкладок, де rAF не викликається.
export function afterFirstPaint(callback) {
  let done = false;

  const run = () => {
    if (done) return;
    done = true;
    callback();
  };

  requestAnimationFrame(() => setTimeout(run, 0));
  setTimeout(run, 1000);
}

// Для блоків, які на старті вже у вьюпорті (або потрапляють у запас rootMargin),
// IntersectionObserver — фікція: він спрацьовує одразу після першого кадру і
// списує вартість чанка в стартовий CPU. Якщо ефект без скролу все одно не
// видно, прив'язуємось не до видимості, а до першого наміру скролити.
// wheel/touchstart/pointerdown летять ПЕРЕД самим scroll, тож ініціалізація
// встигає до першого зсуву сторінки.
export function onFirstInteraction(callback) {
  const events = ['wheel', 'touchstart', 'pointerdown', 'keydown', 'scroll'];
  const listenerOpts = { passive: true, capture: true };
  let done = false;

  const run = () => {
    if (done) return;
    done = true;
    events.forEach(type => window.removeEventListener(type, run, listenerOpts));
    callback();
  };

  events.forEach(type => window.addEventListener(type, run, listenerOpts));
}

// Викликає callback не одразу, а коли елемент наблизиться до viewport.
// rootMargin — запас "на випередження": чанк і ініціалізація встигають
// відпрацювати до того, як користувач реально доскролить до блока.
// once: відписуємось після першого спрацювання — повторної ініціалізації не буде.
export function onEnterView(el, callback, { rootMargin = '800px 0px', once = true } = {}) {
  if (!el) return;

  const observer = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        callback(entry.target);
        if (once) observer.unobserve(entry.target);
      });
    },
    { rootMargin },
  );

  observer.observe(el);
}

// Віддає керування назад у event loop між важкими блоками ініціалізації,
// щоб жоден із них не збирався в один суцільний long task (ТЗ 3.5.2.2).
// scheduler.yield() — коли є, планує продовження з нормальним пріоритетом;
// setTimeout(0) — фолбек для браузерів без цього API.
export function yieldToMain() {
  if ('scheduler' in window && typeof window.scheduler.yield === 'function') {
    return window.scheduler.yield();
  }
  return new Promise(resolve => setTimeout(resolve, 0));
}

// Обробник resize, зведений до одного виклику на кадр. Подія resize під час
// перетягування вікна летить десятками поспіль, і якщо в колбеку є читання
// layout-параметрів (offsetHeight, innerHeight) упереміш із записами в DOM —
// це рівно той forced reflow, на який скаржиться Lighthouse.
//
// ignoreHeightOnly: на мобільних показ/приховування адресного рядка змінює лише
// висоту і генерує потік resize під час звичайного скролу. Для обробників, яким
// важлива тільки ширина, такі події треба пропускати.
export function onResize(callback, { ignoreHeightOnly = false } = {}) {
  let scheduled = false;
  let lastWidth = null;

  const handler = () => {
    if (scheduled) return;
    scheduled = true;

    requestAnimationFrame(() => {
      scheduled = false;

      // window.innerWidth змушує браузер порахувати layout, тому читаємо його
      // лише тоді, коли від нього справді залежить рішення — і лише всередині
      // rAF, де layout і так актуальний. Читання при налаштуванні обробника
      // коштувало 64 мс forced reflow: onResize викликається одразу після
      // запису --vh у DOM, тобто читання йшло по щойно інвалідованих стилях.
      if (ignoreHeightOnly) {
        const width = window.innerWidth;
        const widthChanged = lastWidth === null || width !== lastWidth;
        lastWidth = width;
        if (!widthChanged) return;
      }

      callback();
    });
  };

  window.addEventListener('resize', handler, { passive: true });

  return () => window.removeEventListener('resize', handler);
}
