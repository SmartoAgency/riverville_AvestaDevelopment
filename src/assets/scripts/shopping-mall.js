import './modules/public-path';
import { onResize } from './modules/helpers/defer';
import { gsap } from 'gsap';

function initMallSlider(Swiper, Navigation, Autoplay) {
  const mallSlider = document.querySelector('[data-mall-slider]');
  if (!mallSlider) return;

  const prevButton = mallSlider.querySelector('[data-mall-slider-prev]');
  const nextButton = mallSlider.querySelector('[data-mall-slider-next]');
  if (!prevButton || !nextButton) return;

  Swiper.use([Navigation, Autoplay]);
  new Swiper(mallSlider, {
    slidesPerView: 1,
    loop: true,
    speed: 600,
    autoplay: {
      delay: 4000,
      disableOnInteraction: false,
    },
    navigation: {
      prevEl: prevButton,
      nextEl: nextButton,
    },
  });
}

import(/* webpackChunkName: "swiper" */ 'swiper').then(({ default: Swiper, Navigation, Autoplay }) => {
  initMallSlider(Swiper, Navigation, Autoplay);
});

/* -----------------------------------------------------------------------------
   Helpers
----------------------------------------------------------------------------- */
function onEnterView(el, callback, options) {
  const observer = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        callback(entry.target);
        obs.unobserve(entry.target);
      });
    },
    Object.assign({ threshold: 0, rootMargin: '0px 0px -12% 0px' }, options),
  );
  observer.observe(el);
}

// Wraps each word in a masked span so it can be revealed with a clean
// "slide up out of a mask" motion instead of a flat opacity fade.
function splitWords(el) {
  const words = el.textContent.trim().split(/\s+/);
  const inner = [];
  el.innerHTML = '';
  words.forEach((word, i) => {
    const outer = document.createElement('span');
    outer.style.cssText = 'display:inline-block;overflow:hidden;vertical-align:top;';
    const span = document.createElement('span');
    span.style.display = 'inline-block';
    span.textContent = word;
    outer.appendChild(span);
    el.appendChild(outer);
    if (i < words.length - 1) el.appendChild(document.createTextNode(' '));
    inner.push(span);
  });
  return inner;
}

function formatThousands(n) {
  return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
}

// Counts a numeric value up from 0, keeping whatever text follows the number
// (units, labels) untouched — e.g. "14 000 м²" or "31 711 m²". Assumes the
// element has already been set to autoAlpha:0 / y:16 up front.
function countUp(el) {
  gsap.to(el, { autoAlpha: 1, y: 0, duration: 0.6, ease: 'power3.out', clearProps: 'autoAlpha,y' });

  const text = el.textContent.trim();
  const match = text.match(/^([\d\s]*\d)(.*)$/);
  if (!match) return;

  const grouped = /\s/.test(match[1]);
  const target = parseInt(match[1].replace(/\s/g, ''), 10);
  const suffix = match[2];
  const counter = { value: 0 };

  gsap.to(counter, {
    value: target,
    duration: 1.6,
    ease: 'power2.out',
    onUpdate() {
      const current = Math.round(counter.value);
      el.textContent = (grouped ? formatThousands(current) : String(current)) + suffix;
    },
  });
}

/* -----------------------------------------------------------------------------
   Photos — hidden behind a mask the instant the script runs, so nothing ever
   flashes fully visible before the curtain-wipe reveal plays.
----------------------------------------------------------------------------- */
function revealImage(el) {
  const img = el.querySelector('img');
  const tl = gsap.timeline();
  tl.to(el, { clipPath: 'inset(0 0 0% 0)', duration: 1.1, ease: 'power4.inOut', clearProps: 'clipPath' });
  if (img) {
    tl.to(img, { scale: 1, duration: 1.4, ease: 'power3.out' }, 0);
  }
}

document.querySelectorAll('.mall-slider, .mall-location__img, .mall-render').forEach((el) => {
  const img = el.querySelector('img');
  gsap.set(el, { clipPath: 'inset(0 0 100% 0)' });
  if (img) {
    gsap.set(img, { scale: 1.12, transformOrigin: 'center' });
  }
  onEnterView(el, revealImage);
});

/* -----------------------------------------------------------------------------
   Text blocks — wave icon pops in, title unmasks word by word, copy fades up.
   Every hidden state below is applied immediately (not inside the observer
   callback) so the content is never painted in its final state first.
----------------------------------------------------------------------------- */
document.querySelectorAll('.text-block').forEach((block) => {
  const wave = block.querySelector('.text-block__wave svg');
  const title = block.querySelector('.text-block__title');
  const paragraphs = block.querySelectorAll('.text-block__description, .text-block__subtitle');
  const words = title ? splitWords(title) : null;

  if (wave) gsap.set(wave, { scale: 0, rotate: -20, autoAlpha: 0 });
  if (words) gsap.set(words, { yPercent: 110, autoAlpha: 0 });
  if (paragraphs.length) gsap.set(paragraphs, { y: 24, autoAlpha: 0 });

  onEnterView(block, () => {
    const tl = gsap.timeline();
    if (wave) {
      tl.to(wave, { scale: 1, rotate: 0, autoAlpha: 1, duration: 0.7, ease: 'back.out(2)', clearProps: 'all' }, 0);
    }
    if (words) {
      tl.to(words, { yPercent: 0, autoAlpha: 1, duration: 0.9, ease: 'power4.out', stagger: 0.025, clearProps: 'all' }, 0.15);
    }
    if (paragraphs.length) {
      tl.to(paragraphs, { y: 0, autoAlpha: 1, duration: 1, ease: 'power3.out', stagger: 0.12, clearProps: 'all' }, 0.35);
    }
  });
});

/* -----------------------------------------------------------------------------
   Location block — wave + title unmask, traffic figure and CTA settle in.
----------------------------------------------------------------------------- */
document.querySelectorAll('.mall-location__block').forEach((block) => {
  const wave = block.querySelector('.mall-location__wave svg');
  const title = block.querySelector('.mall-location__text');
  const trafficValue = block.querySelector('.mall-location__header .mall-location__value');
  const button = block.querySelector('.mall-location__button');
  const words = title ? splitWords(title) : null;

  if (wave) gsap.set(wave, { scale: 0, rotate: -20, autoAlpha: 0 });
  if (words) gsap.set(words, { yPercent: 110, autoAlpha: 0 });
  if (trafficValue) gsap.set(trafficValue, { autoAlpha: 0, y: 16 });
  if (button) gsap.set(button, { autoAlpha: 0, y: 16 });

  onEnterView(block, () => {
    const tl = gsap.timeline();
    if (wave) {
      tl.to(wave, { scale: 1, rotate: 0, autoAlpha: 1, duration: 0.7, ease: 'back.out(2)', clearProps: 'all' }, 0);
    }
    if (words) {
      tl.to(words, { yPercent: 0, autoAlpha: 1, duration: 0.8, ease: 'power4.out', stagger: 0.03, clearProps: 'all' }, 0.15);
    }
    if (trafficValue) {
      tl.to(trafficValue, { autoAlpha: 1, y: 0, duration: 0.8, ease: 'power3.out', clearProps: 'all' }, 0.3);
    }
    if (button) {
      tl.to(button, { autoAlpha: 1, y: 0, duration: 0.7, ease: 'power3.out', clearProps: 'all' }, 0.6);
    }
  });
});

/* -----------------------------------------------------------------------------
   Numbers — GBA / GLA figures and the stats row count up instead of fading.
----------------------------------------------------------------------------- */
document.querySelectorAll('.mall-location__item, .mall-stats__item').forEach((item) => {
  const value = item.querySelector('.mall-location__value, .mall-stats__value');
  const labels = item.querySelectorAll('.mall-location__subtitle, .mall-stats__label');

  if (value) gsap.set(value, { autoAlpha: 0, y: 16 });
  if (labels.length) gsap.set(labels, { autoAlpha: 0, y: 12 });

  onEnterView(item, () => {
    if (labels.length) {
      gsap.to(labels, { autoAlpha: 1, y: 0, duration: 0.7, ease: 'power3.out', stagger: 0.08, clearProps: 'all' });
    }
    if (value) countUp(value);
  });
});

document.querySelectorAll('.mall-stats__block').forEach((el) => {
  const subtitle = el.querySelector('.mall-stats__subtitle');
  if (subtitle) gsap.set(subtitle, { autoAlpha: 0, y: 16 });
  onEnterView(el, () => {
    if (subtitle) gsap.to(subtitle, { autoAlpha: 1, y: 0, duration: 0.8, ease: 'power3.out', clearProps: 'all' });
  });
});

document.querySelectorAll('.mall-stats__blue').forEach((el) => {
  const children = Array.from(el.children);
  gsap.set(children, { autoAlpha: 0, y: 24 });
  onEnterView(el, () => {
    gsap.to(children, { autoAlpha: 1, y: 0, duration: 0.9, ease: 'power3.out', stagger: 0.1, clearProps: 'all' });
  });
});

/* -----------------------------------------------------------------------------
   Closing render — title unmasks, background drifts with real scroll parallax.
----------------------------------------------------------------------------- */
const parallaxTitle = document.querySelector('.mall-parallax__title-container');
if (parallaxTitle) {
  const titles = parallaxTitle.querySelectorAll('.mall-parallax__title');
  gsap.set(titles, { y: 30, autoAlpha: 0 });
  onEnterView(parallaxTitle, () => {
    gsap.to(titles, { y: 0, autoAlpha: 1, duration: 1, ease: 'power3.out', stagger: 0.15, clearProps: 'all' });
  });
}

document.querySelectorAll('.mall-parallax__img').forEach((el) => {
  const img = el.querySelector('img');
  if (!img) return;

  el.style.overflow = 'hidden';
  // isolation:isolate makes this element its own stacking context, so the
  // zIndex below is resolved against its ::before gradient sibling instead
  // of escaping to some unrelated ancestor further up the page.
  el.style.isolation = 'isolate';
  // z-index is a no-op on a statically positioned element (the SCSS never
  // sets `position` on this img, so it defaults to static) — "position:
  // relative" is what actually makes the zIndex below take effect and keep
  // the scaled img from painting over the ::before gradient on this element.
  gsap.set(img, { scale: 1.15, transformOrigin: 'center', position: 'relative', zIndex: -1 });

  let ticking = false;
  function update() {
    const rect = el.getBoundingClientRect();
    const vh = window.innerHeight || document.documentElement.clientHeight;
    const center = rect.top + rect.height / 2 - vh / 2;
    const progress = Math.max(-1, Math.min(1, center / (vh / 2 + rect.height / 2)));
    gsap.set(img, { yPercent: progress * -6 });
  }
  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      update();
      ticking = false;
    });
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  // Для скролу update уже throttled через rAF (див. onScroll вище), а для resize
  // викликався напряму, без обмеження частоти. Вирівнюємо поведінку.
  onResize(update);
  update();
});
