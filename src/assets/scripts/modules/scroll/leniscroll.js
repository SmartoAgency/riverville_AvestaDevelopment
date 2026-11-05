// eslint-disable-next-line import/no-extraneous-dependencies
import Lenis from '@studio-freight/lenis';

// Цей модуль — локальний, а splitChunks у webpack.config.js виносить у спільний
// vendors.bundle.js лише пакети з node_modules. Тому код модуля потрапляє в
// КОЖЕН entry-бандл окремо, і `new Lenis()` на рівні модуля виконувався стільки
// разів, скільки бандлів на сторінці. На головній це два екземпляри (index +
// home), кожен зі своїм нескінченним requestAnimationFrame-циклом — тобто
// подвійна кадрова робота протягом усього життя сторінки і два незалежні
// обробники скролу. Саме звідси бралися сотні мілісекунд Script Evaluation,
// які Lighthouse приписував index.bundle.js.
//
// Тримаємо єдиний екземпляр на window: який би бандл не виконався першим,
// решта підхоплять уже створений.
const INSTANCE_KEY = '__riverville_lenis';

// На тач-пристроях плавний скрол не потрібен — там нативний, і він кращий.
//
// Раніше умова перевіряла клас `mobile` на <html>, але його НІХТО не проставляє:
// у розмітці теми його немає, у скриптах — лише читання. Тобто умова завжди була
// false, lenis створювався на мобільних теж, і його requestAnimationFrame-цикл
// крутився кожен кадр протягом усього життя сторінки. У Lighthouse (Moto G Power)
// це давало 2 489 мс Total CPU Time, приписаних vendors.bundle.js, при тому що
// Script Evaluation там лише 76 мс — тобто вартість не в парсингу, а в кадровій
// роботі. Плюс 2 510 мс у категорії "Other".
//
// matchMedia не залежить від класів на розмітці й не бреше на емуляції пристрою.
function isTouchPrimary() {
  return typeof window.matchMedia === 'function'
    && window.matchMedia('(hover: none) and (pointer: coarse)').matches;
}

function createLenis() {
  const instance = new Lenis();

  if (isTouchPrimary()) {
    instance.destroy();
    return instance;
  }

  const raf = time => {
    instance.raf(time);
    requestAnimationFrame(raf);
  };

  requestAnimationFrame(raf);

  return instance;
}

export const lenis = window[INSTANCE_KEY] || (window[INSTANCE_KEY] = createLenis());
