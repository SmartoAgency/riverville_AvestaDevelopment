// ./form тягне за собою yup (+lodash), i18next, cleave.js та intl-tel-input —
// близько 90 KB gzip заради двох полів, які більшість відвідувачів не чіпає.
// Тому він винесений в окремий чанк (form.bundle.js) і вантажиться за першою
// ознакою наміру, а не разом із index.bundle.js.
//
// Тригери свідомо перекривають один одного: попап може відкритись і з клавіатури,
// і скролом до контактного екрана, тому жоден із них окремо не достатній.

let pending = null;

function loadForm() {
  if (!pending) {
    pending = import(/* webpackChunkName: "form" */ './form');
  }
  return pending;
}

// 1. Намір відкрити попап із формою. pointerdown, а не click — виграє ~100 мс
//    між натисканням і відпусканням, за які чанк встигає початися.
//
// Попап [data-popup] відкриває index-app.js, який лишається синхронним, тому
// клік не губиться. А от [data-form-popup] обслуговує сам form.js своїм
// делегованим обробником — якщо чанк у момент кліку ще вантажився, обробника
// просто не існувало. Для цього випадку повторюємо клік, коли модуль готовий.
// На проді цієї гілки немає: [data-form-popup] є лише у pug-збірці
// (includes/form-wrapper.pug), у WP-шаблонах такого елемента немає — тому
// перевіряємо наявність, щоб не плодити синтетичних кліків на живому сайті.
document.addEventListener(
  'pointerdown',
  evt => {
    const target = evt.target.closest && evt.target.closest('[data-popup-call], [data-form-popup-call]');
    if (!target) return;

    const needsReplay =
      pending === null &&
      target.matches('[data-form-popup-call]') &&
      document.querySelector('[data-form-popup]');

    loadForm().then(() => {
      if (needsReplay && target.isConnected) {
        target.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      }
    });
  },
  { capture: true, passive: true },
);

// 2. Фокус у будь-якому полі форми — клавіатурна навігація або автозаповнення,
//    коли кліку по кнопці виклику не було взагалі.
document.addEventListener(
  'focusin',
  evt => {
    if (evt.target.closest && evt.target.closest('[data-popupn-form], [data-contact-screen-form]')) {
      loadForm();
    }
  },
  { capture: true },
);

// 3. Форма контактного екрана під'їжджає до вьюпорта. Вона є на кожній сторінці
//    внизу, тож для тих, хто дочитує до неї, чанк буде готовий заздалегідь.
const contactForm = document.querySelector('[data-contact-screen-form]');

if (contactForm) {
  if (typeof IntersectionObserver === 'undefined') {
    loadForm();
  } else {
    const observer = new IntersectionObserver(
      (entries, self) => {
        if (entries.some(entry => entry.isIntersecting)) {
          self.disconnect();
          loadForm();
        }
      },
      { rootMargin: '400px' },
    );

    observer.observe(contactForm);
  }
}
