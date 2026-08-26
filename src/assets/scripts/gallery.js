import './modules/public-path';
import gallerySlider from "./modules/gallery/gallerySlider";
import gsap from "gsap";

Promise.all([
  import(/* webpackChunkName: "gsap-scroll" */ "gsap/ScrollTrigger"),
  import(/* webpackChunkName: "swiper" */ "swiper"),
]).then(([{ ScrollTrigger }, { default: Swiper, Navigation }]) => {
  gsap.registerPlugin(ScrollTrigger);
  gsap.core.globals('ScrollTrigger', ScrollTrigger);

  Swiper.use([Navigation]);

  gallerySlider(gsap, Swiper);
});
