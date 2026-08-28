import './modules/public-path';
import { gsap } from 'gsap';
import splitToLinesAndFadeUp from './modules/effects/splitLinesAndFadeUp';
import { onFirstInteraction } from './modules/helpers/defer';

// Уся ця робота — scroll-driven анімації: без скролу вони нічого не показують.
// Тому і чанки, і виміри відкладаємо до першого наміру гортати сторінку
// (ТЗ 3.5.2.2: не тримати важку ініціалізацію в першому рендері).
onFirstInteraction(() => {
  Promise.all([
    import(/* webpackChunkName: "gsap-scroll" */ 'gsap/ScrollTrigger'),
    import(/* webpackChunkName: "swiper" */ 'swiper'),
  ]).then(([{ ScrollTrigger }, { default: Swiper, Navigation }]) => {
    Swiper.use([Navigation]);

    gsap.registerPlugin(ScrollTrigger);
    gsap.core.globals('ScrollTrigger', ScrollTrigger);


    splitToLinesAndFadeUp(
      '[data-split-lines-and-fade-up]',
      gsap,
    );

    const documentsSlider = document.querySelector('[data-developer-documents-slider]');

    if (documentsSlider) {
      new Swiper(documentsSlider, {
        speed: 800,
        slidesPerView: 1.15,
        spaceBetween: 16,
        navigation: {
          nextEl: '[data-developer-documents-next]',
          prevEl: '[data-developer-documents-prev]',
        },
        breakpoints: {
          601: {
            slidesPerView: 2,
            spaceBetween: 24,
          },
          1025: {
            slidesPerView: 4,
            spaceBetween: 24,
          },
        },
      });
    }
  });

});