import Swiper, { Navigation } from "swiper";
import gallerySlider from "./modules/gallery/gallerySlider";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

Swiper.use([Navigation]);

gallerySlider(gsap, Swiper);