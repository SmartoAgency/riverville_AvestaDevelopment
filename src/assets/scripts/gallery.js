import './modules/public-path';
import gallerySlider from "./modules/gallery/gallerySlider";
import gsap from "gsap";
import { afterFirstPaint } from './modules/helpers/defer';

// Слайдер тут — основний вміст сторінки, тож ініціалізацію не можна
// відкладати до взаємодії. Але й у критичному кадрі їй не місце:
// виносимо за перший паінт.
afterFirstPaint(() => {
  Promise.all([
    import(/* webpackChunkName: "gsap-scroll" */ "gsap/ScrollTrigger"),
    import(/* webpackChunkName: "swiper" */ "swiper"),
  ]).then(([{ ScrollTrigger }, { default: Swiper, Navigation }]) => {
    gsap.registerPlugin(ScrollTrigger);
    gsap.core.globals('ScrollTrigger', ScrollTrigger);

    Swiper.use([Navigation]);

    gallerySlider(gsap, Swiper);
  });

});