import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { lenis } from './modules/scroll/leniscroll';
import splitToLinesAndFadeUp from './modules/effects/splitLinesAndFadeUp';
import Swiper, { Navigation } from 'swiper';

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