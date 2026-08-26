import './modules/public-path';
import { gsap } from 'gsap';
import Headroom from 'headroom.js';
import { lenis } from './modules/scroll/leniscroll';
import { pad, useState } from './modules/helpers/helpers';
import splitToLinesAndFadeUp from './modules/effects/splitLinesAndFadeUp';
import gallerySlider from './modules/gallery/gallerySlider';

const header = document.querySelector('.header');

const headroom = new Headroom(header, {});
headroom.init();

document.querySelectorAll('.home-front-screen__arrow').forEach(el => {
  el.addEventListener('click', () => {
    document.querySelector('.home-about-screen').scrollIntoView({ behavior: 'smooth' });
  });
});


// function screen1() {
//   const videoBtn = document.querySelector('.home-front-screen__video-btn');
//   const videoWrapper = document.querySelector('.home-front-screen__video');
//   const videoElement = document.querySelector('.home-front-screen__video video');
//   const header = document.querySelector('header');

//   function openVideo() {
//     videoWrapper.classList.add('active');
//     header.classList.add('hidden-for-video');
//     videoElement.muted = false;
//     videoElement.setAttribute('controls', 'true');
//   }

//   function shrinkVideo() {
//     videoWrapper.classList.remove('active');
//     header.classList.remove('hidden-for-video');
//     videoElement.muted = true;
//     videoElement.removeAttribute('controls');
//   }

//   function removeVideoCompletely() {
//     videoWrapper.style.transition = 'transform 0.4s ease, opacity 0.4s ease';
//     videoWrapper.style.transform = 'translateX(120%)';
//     videoWrapper.style.opacity = '0';

//     videoElement.muted = true;
//     videoElement.pause();

//     setTimeout(() => {
//         videoWrapper.style.display = 'none';
//         header.classList.remove('hidden-for-video');
//     }, 400);
//   }

//   if (document.documentElement.clientWidth > 680) {
//     window.addEventListener('click', () => {
//       if(videoElement.paused && videoWrapper.style.display !== 'none') {
//           videoElement.play().catch(() => {});
//       }
//     }, { once: true });
//   }

//   if (videoBtn) {
//       videoBtn.closest('.home-front-screen__video').addEventListener('click', (evt) => {
//         if (evt.target.tagName === 'VIDEO' && !videoElement.muted) return;

//         evt.preventDefault();

//         if (videoWrapper.style.display === 'none') return;

//         if (videoElement.muted) {
//           openVideo();
//         } else {
//           shrinkVideo();
//         }
//       });
//   }


//   let xDown = null;
//   let yDown = null;

//   function handleTouchStart(evt) {
//     if (videoWrapper.classList.contains('active')) {
//         return;
//     }

//     const firstTouch = evt.touches ? evt.touches[0] : evt;
//     xDown = firstTouch.clientX;
//     yDown = firstTouch.clientY;
//   };

//   function handleTouchMove(evt) {
//     if (videoWrapper.classList.contains('active') || !xDown || !yDown) {
//       return;
//     }

//     const firstTouch = evt.touches ? evt.touches[0] : evt;
//     const xUp = firstTouch.clientX;
//     const yUp = firstTouch.clientY;

//     const xDiff = xDown - xUp;
//     const yDiff = yDown - yUp;

//     if (Math.abs(xDiff) > Math.abs(yDiff)) {

//       if (Math.abs(xDiff) > 50) {
//         if (xDiff > 0) {
//         } else {
//           console.log('Swipe Right on Small Video -> Removing');
//           removeVideoCompletely();
//         }
//         xDown = null;
//         yDown = null;
//       }
//     }
//   };

//   videoWrapper.addEventListener('touchstart', handleTouchStart, { passive: true });
//   videoWrapper.addEventListener('touchmove', handleTouchMove, { passive: true });

//   let isMouseDown = false;
//   videoWrapper.addEventListener('mousedown', (e) => { isMouseDown = true; handleTouchStart(e); });
//   videoWrapper.addEventListener('mouseup', () => { isMouseDown = false; xDown = null; yDown = null; });
//   videoWrapper.addEventListener('mousemove', (e) => { if(isMouseDown) handleTouchMove(e); });


//   gsap.timeline({
//     scrollTrigger: {
//       trigger: '.home-front-screen',
//       onLeave() {
//         videoElement.pause();
//       },
//       onEnterBack() {
//         if (videoWrapper.style.display !== 'none') {
//             videoElement.play();
//         }
//       },
//     },
//   });
// }

// screen1();

// Виконує callback після того, як браузер намалював кадр.
// requestAnimationFrame спрацьовує ПЕРЕД відмальовуванням, тому самого rAF
// (і навіть подвійного) недостатньо — робота лишиться в критичному кадрі.
// setTimeout усередині rAF стає в чергу задач і виконається вже після паінту.
// Зовнішній setTimeout — підстраховка для фонових вкладок, де rAF не викликається.
function afterFirstPaint(callback) {
  let done = false;

  const run = () => {
    if (done) return;
    done = true;
    callback();
  };

  requestAnimationFrame(() => setTimeout(run, 0));
  setTimeout(run, 1000);
}

// Віддає керування назад у event loop між важкими блоками ініціалізації,
// щоб жоден із них не збирався в один суцільний long task (ТЗ 3.5.2.3/3.5.2.2).
// scheduler.yield() — коли є, планує продовження з нормальним пріоритетом;
// setTimeout(0) — фолбек для браузерів без цього API.
function yieldToMain() {
  if ('scheduler' in window && typeof window.scheduler.yield === 'function') {
    return window.scheduler.yield();
  }
  return new Promise(resolve => setTimeout(resolve, 0));
}

// Раніше весь кошт gsap-scroll.bundle.js/swiper.bundle.js (реєстрація
// ScrollTrigger, ~800 ms на getComputedStyle і Layout по всій сторінці —
// 519 КБ html, 76 інлайнових svg) списувався одним заходом одразу після
// першого кадру. Lighthouse фіксував це як long tasks на позначках ~4,1-4,6с
// (ТЗ 3.5.2.1, підпункт 3) — хоча переважна більшість блоків, що
// ініціалізувались, у цей момент ще навіть не в зоні видимості.
//
// Тепер ініціалізація відкладена у два рівні:
//  1) afterFirstPaint — сама підписка на IntersectionObserver'и дешева
//     (querySelectorAll + observer.observe, без gsap/getComputedStyle),
//     тож не тримає LCP;
//  2) кожен блок довантажує gsap/ScrollTrigger і/або swiper та
//     ініціалізується лише тоді, коли наближається до viewport — з запасом
//     rootMargin, щоб чанк встиг довантажитись і виконатись до того, як
//     користувач реально доскролить. Секції, які на момент завантаження
//     сторінки взагалі не видно, у Lighthouse-трейсі (він сторінку не
//     скролить) тепер не ініціалізуються — і не додають CPU-часу в TBT.

let scrollTriggerPromise = null;
function loadScrollTrigger() {
  if (!scrollTriggerPromise) {
    scrollTriggerPromise = import(/* webpackChunkName: "gsap-scroll" */ 'gsap/ScrollTrigger').then(({ ScrollTrigger }) => {
      gsap.registerPlugin(ScrollTrigger);
      gsap.core.globals('ScrollTrigger', ScrollTrigger);
      return ScrollTrigger;
    });
  }
  return scrollTriggerPromise;
}

let swiperPromise = null;
function loadSwiper() {
  if (!swiperPromise) {
    // Mousewheel/Navigation реєструються тут один раз — глобально на клас
    // Swiper, тож усі інстанси нижче (advantages/gallery/incredible) вже
    // мають ці модулі, хто б з них не довантажив swiper першим.
    swiperPromise = import(/* webpackChunkName: "swiper" */ 'swiper').then((mod) => {
      mod.default.use([mod.Mousewheel, mod.Navigation]);
      return mod;
    });
  }
  return swiperPromise;
}

// Викликає callback не одразу, а коли елемент наблизиться до viewport.
// rootMargin — запас "на випередження": чанк і ініціалізація встигають
// відпрацювати до того, як користувач реально доскролить до блока.
// once: відписуємось після першого спрацювання — повторної ініціалізації не буде.
function onEnterView(el, callback, { rootMargin = '800px 0px', once = true } = {}) {
  if (!el) return;
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      callback(entry.target);
      if (once) observer.unobserve(entry.target);
    });
  }, { rootMargin });
  observer.observe(el);
}

// Для блоків, які на старті вже у вьюпорті (або потрапляють у запас rootMargin),
// IntersectionObserver — фікція: він спрацьовує одразу після першого кадру і
// списує вартість чанка в стартовий CPU. Якщо ефект без скролу все одно не
// видно, прив'язуємось не до видимості, а до першого наміру скролити.
// wheel/touchstart/pointerdown летять ПЕРЕД самим scroll, тож ініціалізація
// встигає до першого зсуву сторінки.
function onFirstInteraction(callback) {
  const events = ['wheel', 'touchstart', 'pointerdown', 'keydown', 'scroll'];
  const listenerOpts = { passive: true, capture: true };
  let done = false;

  const run = () => {
    if (done) return;
    done = true;
    events.forEach(type => window.removeEventListener(type, run, listenerOpts));
    callback();
  };

  events.forEach(type => window.addEventListener(type, run, listenerOpts));
}

function applyScrollTriggerAnimation(selectors) {
  document.querySelectorAll(selectors).forEach(el => {
    onEnterView(el, async () => {
      await loadScrollTrigger();
      gsap
        .timeline({
          scrollTrigger: {
            trigger: el,
            start: '50% bottom',
            // end: 'bottom center',
            once: true,
          },
        })
        .fromTo(
          Array.from(el.children),
          { y: 25, autoAlpha: 0 },
          { y: 0, autoAlpha: 1, clearProps: 'all', duration: 1.25, ease: 'power4.out', stagger: 0.1 },
        );
    });
  });
}

function initAdvantagesSlider() {
  const container = document.querySelector('[data-home-advantages-block2]');
  onEnterView(container, async () => {
    const { default: Swiper } = await loadSwiper();

    const advblock2 = new Swiper('[data-home-advantages-block2]', {
      slidesPerView: 3.1,
      // slidesPerView: 'auto',
      // modules: [Mousewheel],
      speed: 1000,
      enabled: true,
      centeredSlides: true,
      initialSlide: window.screen.width < 600 ? 0 : 1,
      sensitivity: 4,
      // Гортання горизонтальним свайпом тачпада (два пальці).
      // forceToAxis: реагуємо лише на горизонтальний рух (deltaX), тож вертикальний
      // скрол сторінки над слайдером і звичайне колесо миші не перехоплюються.
      mousewheel: {
        forceToAxis: true,
        releaseOnEdges: true,
        sensitivity: 1,
        // Один свайп = один слайд. Тачпад шле пачку wheel-подій (інерція),
        // тож throttle-имо: thresholdTime — мін. пауза між перемиканнями (мс),
        // thresholdDelta — ігнорувати мікрорухи. Якщо здається млявим — зменш thresholdTime.
        thresholdDelta: 6,
        thresholdTime: 900,
      },
      navigation: {
        nextEl: '[data-home-advantages-block2-next]',
        prevEl: '[data-home-advantages-block2-prev]',
      },
      on: {
        init: swiper => {
            document.querySelector('[data-home-advantages-block2-total]').textContent = pad(swiper.slides.length);
        }
      },
      breakpoints: {
        320: {
          slidesPerView: 1.2,
          centeredSlides: true,
          // mousewheel: {
          //   enabled: false,
          // },
        },
        601: {
          slidesPerView: 1.2,
          // mousewheel: {
          //   enabled: false,
          // },
        },
        1024: {
          slidesPerView: 3.1,
          // mousewheel: {
          //   enabled: true,
          // },
        },
      },
    });
    advblock2.on('slideChange', (swiper) => {
      document.querySelector('[data-home-advantages-block2-current]').textContent = pad(swiper.realIndex + 1);
    });
  });
}

function initGallerySlider() {
  const gallery = document.querySelector('[data-home-gallery-screen]');
  onEnterView(gallery, async () => {
    const [, { default: Swiper }] = await Promise.all([loadScrollTrigger(), loadSwiper()]);
    gallerySlider(gsap, Swiper);
  });
}

function constructionScreenObserver() {
  //.home-construction-screen intersection observer
  const constructionScreen = document.querySelector('.home-construction-screen');
  if (!constructionScreen) return;
  console.log('constructionScreenObserver');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        loadScrollTrigger().then(ScrollTrigger => {
          ScrollTrigger.refresh();
          console.log('Construction screen is visible');
        });
      } else {
      }
    });
  }, {
    threshold: 0.1, // Adjust this value as needed
  });
  observer.observe(constructionScreen);
}

function initNewsWaveAnimation() {
  const newsScreen = document.querySelector('.home-news-screen');
  onEnterView(newsScreen, async () => {
    await loadScrollTrigger();

    gsap.timeline({
      defaults: {
        ease: 'none',
      },
      scrollTrigger: {
          // trigger: '[data-wave1-block]',
          trigger: '.home-news-screen',
            start: '0% top',
          // pin: '[data-wave1-block-content]',
          end: '40% top',
          // endTrigger: '.home-news-screen',
          // start: 'top top',
          // end: '100% top',
          scrub: 0,
          // markers: true
      }
    })
        .fromTo('[data-wave-block-top]', { y: 0 }, { y: window.screen.height * -0.75, ease: 'none' })
        .fromTo('[data-wave-block-bottom]', { y: 0 }, { y: window.screen.height * 0.75, ease: 'none' }, '<')

        gsap.timeline({
          defaults: {
          ease: 'none',
        },
        scrollTrigger: {
            trigger: '.home-news-screen',
            // pin: '[data-wave2-block-content]',
            // start: 'top top',
            start: '60% bottom',
            end: '100% bottom',
            // endTrigger: '.home-news-screen',
            scrub: 0,
            // markers: true
        }
    })
        .fromTo(
            '[data-wave2-block-top]',
            { y: window.screen.width < 600 ? window.screen.height * -1 : window.screen.height * -0.75 },
            { y: 0, ease: 'none'  }
        )
        .fromTo(
            '[data-wave2-block-bottom]',
            { y: window.screen.width < 600 ? window.screen.height : window.screen.height * 0.75 },
            { y: 0, ease: 'none' },
            '<'
        )
  });
}

const SPLIT_LINES_SELECTOR =
  '[data-split-lines-and-fade-up], .home-location-screen__content .text-style-1920-body, .home-location-screen__title, .home-about-screen__title, .home-about-screen__subtitle, .home-gallery-screen__title, .home-construction-screen__title';

// Раніше: один прохід по всій сторінці на requestIdleCallback — переписати
// innerHTML кожного заголовка, gsap.set і ScrollTrigger на кожен, включно з
// тими, що за сім екранів нижче. Плюс безумовний loadScrollTrigger(), через
// який чанк gsap-scroll вантажився на головній завжди, навіть якщо жоден
// scroll-ефект так і не знадобився.
//
// Тепер кожен заголовок обробляється у момент входу у вьюпорт, а сам ефект
// іде в режимі immediate — момент старту задає IntersectionObserver, тож
// ScrollTrigger тут не потрібен взагалі (rootMargin 0 = ScrollTrigger'ів
// дефолтний start 'top bottom'). Потрібне лише ядро gsap.
function initSplitLinesAndFadeUp() {
  document.querySelectorAll(SPLIT_LINES_SELECTOR).forEach(el => {
    onEnterView(el, () => splitToLinesAndFadeUp(el, gsap, { immediate: true }), {
      rootMargin: '0px',
    });
  });
}

function initIncredibleBlock() {
  const incredibleBlock = document.querySelector('.home-incredible-block');
  onEnterView(incredibleBlock, async () => {
    await loadScrollTrigger();

    const offset = 50;
    document.querySelectorAll('.home-incredible-block__item').forEach(el => {
      gsap.timeline({
        scrollTrigger: {
          trigger: el,
          start: `-${offset}px 80%`,
          end: '30% 80%',
          scrub: true,
          markers: /localhost/.test(window.location.href),
        },
      })
        .fromTo(el, { y: offset, autoAlpha: 0 }, { y: 0, autoAlpha: 1, clearProps: 'all' });
    });

    if (window.screen.width > 600) return;

    await yieldToMain();

    const incredibleBlockMobileSlider = document.querySelector('[data-incredible-block-mobile-slider]');
    if (!incredibleBlockMobileSlider) return;

    const { default: Swiper } = await loadSwiper();

    const swiper = new Swiper(incredibleBlockMobileSlider, {
      slidesPerView: 1.15,
      navigation: {
        nextEl: '[data-incredible-block-mobile-next]',
        prevEl: '[data-incredible-block-mobile-prev]',
      },
      on: {
        init: swiper => {
            document.querySelector('[data-incredible-block-mobile-total]').textContent = pad(swiper.slides.length);
        }
      },
    });

    swiper.on('slideChange', (swiper) => {
      document.querySelector('[data-incredible-block-mobile-current]').textContent = pad(swiper.realIndex + 1);
    });
  });
}

function homeParalax(container) {
  gsap.timeline({
    scrollTrigger: {
      trigger: container,
      scrub: true,
    }
  }).from(container.querySelector('img'), {
    scale: 1.2,
    transformOrigin: 'bottom',
  }).to(container, {
    y: window.screen.width < 600 ? -20 : -100,
    transformOrigin: 'bottom',
  }, '<');
}

function initHomeParalaxBackgrounds() {
  document.querySelectorAll('.home-about-screen__bg, .home-location-screen__bg, .home-advantages-block__bg').forEach(el => {
    onEnterView(el, async () => {
      await loadScrollTrigger();
      homeParalax(el);
    });
  });
}

// Викликається вже після першої взаємодії (див. initAnimations), тому свого
// гейта не має: фронт-екран за визначенням у вьюпорті, чекати на IO нема сенсу.
async function initFrontScreenParalax() {
  const frontScreen = document.querySelector('.home-front-screen');
  if (!frontScreen) return;

  await loadScrollTrigger();

  gsap.timeline({
    scrollTrigger: {
      trigger: '.home-front-screen',
      start: 'top top',
      scrub: 1,
    },
  })
    .fromTo('.home-front-screen__bg img', { scale: 1 }, { scale: 1.05, clearProps: 'all', immediateRender: false })
    .fromTo('.home-front-screen__bg', { y: 0 }, { y: document.documentElement.clientHeight * 0.25, clearProps: 'all', immediateRender: false }, '<');
}

function initAnimations() {
  // Split-lines більше не залежить від ScrollTrigger — його роль виконує
  // IntersectionObserver, а ядро gsap і так в initial-чанку. Тому лишаємо
  // на idle: заголовки над згином анімуються як і раніше, не чекаючи скролу.
  // Підписка дешева, але переписування innerHTML для вже видимих заголовків
  // станеться синхронно в першому ж колбеку IO — звідси idle, щоб не влізти
  // у критичне вікно одразу після першого кадру.
  if ('requestIdleCallback' in window) {
    requestIdleCallback(initSplitLinesAndFadeUp, { timeout: 2000 });
  } else {
    setTimeout(initSplitLinesAndFadeUp, 200);
  }

  // Решта — scroll-driven анімації та слайдери. На головній усі вони лежать
  // нижче першого екрана і без скролу не показують нічого, тому реєструємо
  // спостерігачі лише після першого наміру скролити.
  //
  // Сам по собі IntersectionObserver цю проблему не закривав: із запасом
  // rootMargin 800px він чіпляє вже другу секцію (.home-about-screen__items,
  // .home-about-screen__bg) одразу після першого кадру — і тягне gsap-scroll
  // у стартовий CPU навіть у Lighthouse, який сторінку взагалі не скролить.
  // Тепер працює зв'язка: взаємодія відкриває групу, а IO всередині вирішує,
  // який саме блок ініціалізувати (ТЗ 3.5.2.1, підпункт 3 — «після взаємодії
  // користувача або коли блок потрапляє у viewport»).
  onFirstInteraction(() => {
    applyScrollTriggerAnimation(
      '.contact-screen__table-item, .contact-screen .contact-screen-form, .home-sticky-block__item, .home-video-block__decor, .home-advantages-block__title, .home-location-screen__slogan, .home-location-screen__light, .home-about-screen__items',
    );

    initAdvantagesSlider();
    initGallerySlider();
    constructionScreenObserver();
    initNewsWaveAnimation();
    initIncredibleBlock();
    initHomeParalaxBackgrounds();
    initFrontScreenParalax();
  });
}

afterFirstPaint(initAnimations);
