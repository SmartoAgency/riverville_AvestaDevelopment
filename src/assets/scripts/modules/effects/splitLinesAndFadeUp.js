// Приймає CSS-селектор (як і раніше — так його викликають about/commercial/
// developer/restaurant) або конкретний елемент чи колекцію. Поелементний виклик
// потрібен головній: там ефект вішається не одним проходом по всій сторінці,
// а на кожен заголовок окремо, коли той доходить до вьюпорта.
function toElements(target) {
  if (typeof target === 'string') return Array.from(document.querySelectorAll(target));
  if (target instanceof Element) return [target];
  if (target && typeof target.length === 'number') return Array.from(target);
  return [];
}

const WORD_OR_TAG = /<\s*(\w+\b)(?:(?!<\s*\/\s*\1\b)[\s\S])*<\s*\/\s*\1\s*>|\S+/g;

// Обгортка кожного слова. Раніше overflow/display доставлялись двома викликами
// gsap.set() ПІСЛЯ запису innerHTML — а gsap перед записом стилю читає обчислені
// значення, тобто на кожен заголовок виходило читання layout одразу після його
// інвалідації. Тепер ті самі стилі їдуть прямо в розмітці: жодного читання,
// жодного зайвого проходу по DOM.
const wrap = word =>
  `<span style="display:inline-flex;overflow:hidden"><span style="display:inline-block;overflow:initial">${word}</span></span>`;

// immediate: програти анімацію одразу, без ScrollTrigger. Момент запуску в
// цьому режимі визначає той, хто викликає (на головній — IntersectionObserver),
// тому тягнути заради цього чанк gsap-scroll не потрібно: ScrollTrigger тут
// робив рівно те саме, що й IO з threshold 0 — стартував, коли верх елемента
// перетинав нижню межу вьюпорта, і більше не повторювався (once: true).
export default function splitToLinesAndFadeUp(target, gsap, { immediate = false } = {}) {
  const elements = toElements(target);
  if (!elements.length) return;

  // Фаза 1 — тільки читання. Жодного запису в DOM, тож layout лишається валідним
  // і браузер не мусить перераховувати його між елементами.
  const prepared = [];

  elements.forEach(text => {
    const words = text.innerHTML.match(WORD_OR_TAG);
    if (words === null) return;
    prepared.push({ text, html: words.map(wrap).join(' ') });
  });

  if (!prepared.length) return;

  // Фаза 2 — тільки записи, одним проходом.
  prepared.forEach(({ text, html }) => {
    text.innerHTML = html;
  });

  // Фаза 3 — анімація. Перший дотик gsap до елемента читає його стан, але це
  // вже після того, як усі записи в DOM завершені, тож читання-запис не
  // чергуються по колу (layout thrashing).
  prepared.forEach(({ text }) => {
    gsap
      .timeline(
        immediate
          ? {}
          : {
              scrollTrigger: {
                trigger: text,
                once: true,
              },
            },
      )
      .fromTo(
        text.querySelectorAll('span>span'),
        { yPercent: 100 },
        { yPercent: 0, stagger: 0.05, duration: 1, ease: 'power4.out' },
      )
      .add(() => {
        text.innerHTML = text.textContent;
      });
  });
}
