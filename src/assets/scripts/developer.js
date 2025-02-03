import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/all';
import { lenis } from './modules/scroll/leniscroll';
import splitToLinesAndFadeUp from './modules/effects/splitLinesAndFadeUp';


gsap.registerPlugin(ScrollTrigger);


splitToLinesAndFadeUp(
  '[data-split-lines-and-fade-up]',
  gsap,
);