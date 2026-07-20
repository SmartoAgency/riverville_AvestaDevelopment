import Swiper, { Navigation } from 'swiper';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Headroom from 'headroom.js';
import { lenis } from './modules/scroll/leniscroll';
import splitToLinesAndFadeUp from './modules/effects/splitLinesAndFadeUp';

// Header hide/show on scroll (same behaviour as the home & about pages).
const header = document.querySelector('.header');
if (header) {
  const headroom = new Headroom(header, {});
  headroom.init();
}

gsap.registerPlugin(ScrollTrigger);
gsap.core.globals('ScrollTrigger', ScrollTrigger);

// Keep ScrollTrigger in sync with Lenis' smooth scroll. Without this the
// triggers are only evaluated once on load (so only the first screen animates)
// and never update as Lenis drives the scroll position.
if (lenis && typeof lenis.on === 'function') {
  lenis.on('scroll', ScrollTrigger.update);
}

Swiper.use([Navigation]);

console.log("ifokewjfkjwelkfj")

/* -----------------------------------------------------------------------------
   Staggered fade-up of grouped content blocks.
   (Same effect used across the home / about / commercial pages.)
----------------------------------------------------------------------------- */
function staggerFadeUp(selector) {
  document.querySelectorAll(selector).forEach(el => {
    gsap
      .timeline({
        scrollTrigger: {
          trigger: el,
          // fire as soon as the block enters the viewport from the bottom
          start: 'top 80%',
          once: true,
        },
      })
      .fromTo(
        Array.from(el.children),
        { y: 40, autoAlpha: 0 },
        {
          y: 0,
          autoAlpha: 1,
          clearProps: 'all',
          duration: 1.25,
          ease: 'power4.out',
          stagger: 0.1,
        },
      );
  });
}

staggerFadeUp('.restaurant-header, .restaurant-block');

/* -----------------------------------------------------------------------------
   Single-element fade-up (decor wave, long descriptions, planning slider).
----------------------------------------------------------------------------- */
function fadeUp(selector) {
  document.querySelectorAll(selector).forEach(el => {
    gsap.fromTo(
      el,
      { y: 40, autoAlpha: 0 },
      {
        y: 0,
        autoAlpha: 1,
        clearProps: 'all',
        duration: 1.2,
        ease: 'power4.out',
        scrollTrigger: {
          trigger: el,
          // fire as soon as the element enters the viewport from the bottom
          start: 'top 85%',
          once: true,
        },
      },
    );
  });
}

fadeUp(
  '.restaurant-description__img, .restaurant-description__description, .restaurant-planing',
);

/* -----------------------------------------------------------------------------
   Word-by-word reveal for the short section titles.
   (Same effect used for the home-page section titles.)
----------------------------------------------------------------------------- */
splitToLinesAndFadeUp('.restaurant-description__title', gsap);

/* -----------------------------------------------------------------------------
   Background parallax — scale + subtle vertical drift, clipped by the
   overflow:hidden wrapper. (Same effect as the home / about screens.)
----------------------------------------------------------------------------- */
function backgroundParallax(container) {
  const img = container.querySelector('img');
  if (!img) return;

  gsap.set(img, { scale: 1.15, transformOrigin: 'center' });
  gsap.fromTo(
    img,
    { yPercent: -6 },
    {
      yPercent: 6,
      ease: 'none',
      scrollTrigger: {
        trigger: container,
        scrub: true,
      },
    },
  );
}

document.querySelectorAll('.restaurant__bg').forEach(backgroundParallax);

/* -----------------------------------------------------------------------------
   Flowing wave — drift the repeating wave strip while the section scrolls,
   giving the riverville waves a gentle "current" motion.
----------------------------------------------------------------------------- */
document.querySelectorAll('.restaurant__wave').forEach(wave => {
  const section = wave.closest('.restaurant');
  gsap.fromTo(
    wave,
    { backgroundPosition: '0px 0px' },
    {
      backgroundPosition: '-400px 0px',
      ease: 'none',
      scrollTrigger: {
        trigger: section || wave,
        start: 'top bottom',
        end: 'bottom top',
        scrub: true,
      },
    },
  );
});

/* -----------------------------------------------------------------------------
   Planning slider.
----------------------------------------------------------------------------- */
function initRestaurantPlaningSlider() {
  const container = document.querySelector('[data-restaurant-planing-slider]');
  if (!container) return;

  // eslint-disable-next-line no-new
  new Swiper(container, {
    slidesPerView: 1,
    speed: 600,
    navigation: {
      nextEl: '[data-next-slide]',
      prevEl: '[data-prev-slide]',
    },
  });
}

initRestaurantPlaningSlider();

/* -----------------------------------------------------------------------------
   Recalculate trigger positions once the heavy background images / fonts have
   finished loading. Without this, ScrollTrigger reads stale offsets and the
   reveals can fire before their element actually reaches the viewport.
----------------------------------------------------------------------------- */
window.addEventListener('load', () => ScrollTrigger.refresh());
