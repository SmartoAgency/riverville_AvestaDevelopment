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

function createLenis() {
  const instance = new Lenis();

  // На мобільних плавний скрол вимкнено — там нативний.
  if (document.documentElement.classList.contains('mobile')) {
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
