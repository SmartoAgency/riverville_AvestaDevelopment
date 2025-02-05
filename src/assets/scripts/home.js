import Swiper, { Mousewheel, Navigation } from 'swiper';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/all';
import Headroom from 'headroom.js';
import { lenis } from './modules/scroll/leniscroll';
import { pad, useState } from './modules/helpers/helpers';
import splitToLinesAndFadeUp from './modules/effects/splitLinesAndFadeUp';
import { speed } from 'jquery';
import gallerySlider from './modules/gallery/gallerySlider';

const header = document.querySelector('.header');

const headroom = new Headroom(header, {});
headroom.init();

gsap.registerPlugin(ScrollTrigger);
gsap.core.globals('ScrollTrigger', ScrollTrigger);

document.querySelectorAll('.home-front-screen__arrow').forEach(el => {
  el.addEventListener('click', () => {
    document.querySelector('.home-about-screen').scrollIntoView({ behavior: 'smooth' });
  });
});


function screen1() {
  const videoBtn = document.querySelector('.home-front-screen__video-btn');
  const videoWrapper = document.querySelector('.home-front-screen__video');
  const videoElement = document.querySelector('.home-front-screen__video video');
  const header = document.querySelector('header');

  if (document.documentElement.clientWidth > 680) {
    window.addEventListener('click', () => {
      videoElement.play();
    });
  }

  videoBtn.closest('.home-front-screen__video').addEventListener('click', (evt) => {
    evt.preventDefault();
    if (videoElement.muted) {
      videoWrapper.classList.add('active');
      header.classList.add('hidden-for-video');
      videoElement.muted = false;
      videoElement.setAttribute('controls', 'true');
    } else {
      videoWrapper.classList.remove('active');
      header.classList.remove('hidden-for-video');
      videoElement.muted = true;
      videoElement.removeAttribute('controls');
    }
  });

  gsap.timeline({
    scrollTrigger: {
      trigger: '.home-front-screen',
      onLeave() {
        videoElement.pause();
      },
      onEnterBack() {
        videoElement.play();
      },
    },
  });
}
screen1();

function applyScrollTriggerAnimation(selectors) {
  document.querySelectorAll(selectors).forEach(el => {
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
}

applyScrollTriggerAnimation(
  '.contact-screen__table-item, .contact-screen .contact-screen-form, .home-sticky-block__item, .home-video-block__decor, .home-advantages-block__title, .home-location-screen__slogan, .home-location-screen__light, .home-about-screen__items',
);

Swiper.use([Mousewheel, Navigation]);
const advblock2 = new Swiper('[data-home-advantages-block2]', {
  slidesPerView: 3.1,
  // slidesPerView: 'auto',
  // modules: [Mousewheel],
  speed: 1000,
  enabled: true,
  sensitivity: 4,
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
      slidesPerView: 1,
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

if (window.screen.width > 1024) {
  gsap.timeline({
    scrollTrigger: {
      trigger: '.home-advantages-block2',
      pin: '.home-advantages-block2 .swiper',
      start: 'top top',
      end: 'bottom bottom',
      onEnter: () => {
        console.log(advblock2);
        
      },
      onUpdate: self => {
        advblock2.setProgress(self.progress);
        console.log(self.progress);
        
      }
    }
  })
}
// if (document.documentElement.clientWidth > 1024) {
//   const isSwiperCentered = swiperElement => {
//     const rect = swiperElement.getBoundingClientRect();
//     const elementCenter = rect.top + rect.height / 2;
//     const viewportCenter = window.innerHeight / 2;

//     const offset = 80;
//     return Math.abs(elementCenter - viewportCenter) <= offset;
//   };

//   const checkMousewheelConditions = () => {
//     const isCentered = isSwiperCentered(advblock2.el);

//     if (isCentered && !advblock2.isBeginning && !advblock2.isEnd) {
//       console.log('stopped');
      
//       advblock2.params.speed = 200;
//       lenis.stop();
//       advblock2.mousewheel.enable();
//     } else if (lenis.isStopped) {
//       setTimeout(() => {
//         console.log('start', lenis);
//         advblock2.params.speed = 1000;
//         lenis.start();
//       }, 700);
//       advblock2.mousewheel.disable();
//     }
//   };

//   window.addEventListener('scroll', () => {
//     checkMousewheelConditions();
//   });

//   window.addEventListener('resize', checkMousewheelConditions);

//   advblock2.on('slideChange', (swiper) => {
//     checkMousewheelConditions();
//     document.querySelector('[data-home-advantages-block2-current]').textContent = pad(swiper.realIndex + 1);
//   });

//   checkMousewheelConditions();
// }


gallerySlider(gsap, Swiper);

gsap.timeline({
    scrollTrigger: {
        trigger: '[data-wave1-block]',
        pin: '[data-wave1-block-content]',
        // end: '0% top',
        // endTrigger: '.home-news-screen',
        // start: 'top top',
        // end: '100% top',
        scrub: 1,
        markers: false,
    }
})
    .fromTo('[data-wave-block-top]', { y: 0 }, { y: window.screen.height * -0.75, ease: 'none' })
    .fromTo('[data-wave-block-bottom]', { y: 0 }, { y: window.screen.height * 0.75, ease: 'none' }, '<')

    gsap.timeline({
    scrollTrigger: {
        trigger: '[data-wave2-block]',
        pin: '[data-wave2-block-content]',
        end: '100% bottom',
        // endTrigger: '.home-news-screen',
        scrub: 1,
        markers: false,
    }
})
    .fromTo(
        '[data-wave2-block-top]',
        { y: window.screen.width < 600 ? window.screen.height * -1 : window.screen.height * -0.75 },
        { y: 0, ease: 'none', duration: 0.75  }
    )
    .fromTo(
        '[data-wave2-block-bottom]',
        { y: window.screen.width < 600 ? window.screen.height : window.screen.height * 0.75 },
        { y: 0, ease: 'none', duration: 0.75  },
        '<'
    )
    .to(
        '[data-wave2-block-bottom]',
        { y: 0, ease: 'none', duration: 0.25 }
    )

gsap
  .timeline({
    scrollTrigger: {
      trigger: '.home-news-screen',
      start: '5% 50%',
      end: '10% 50%',
      markers: false,
      scrub: 1,
    },
  })
  .fromTo('.home-news-screen__content', { 
    opacity: 0,
    y: 100,
  }, { 
    y: 0,
    opacity: 1, clearProps: 'all' 
  });

splitToLinesAndFadeUp(
  '[data-split-lines-and-fade-up], .home-location-screen__content .text-style-1920-body, .home-location-screen__title, .home-about-screen__title, .home-about-screen__subtitle, .home-advantages-block__title, .home-gallery-screen__title, .home-construction-screen__title',
  gsap,
);



function frontVideoDesktopAnimation() {
  if (document.documentElement.clientWidth < 600) return;

  console.log('f');
  

  gsap.timeline({
    scrollTrigger: {
      trigger: '.home-front-screen',
    start: `${window.innerHeight} bottom`,
    end: 'bottom bottom',
    pin: '.home-front-screen__video-wrapper', 
    markers: /localhost/.test(window.location.href),
    }
  })  
}

frontVideoDesktopAnimation();


document.querySelectorAll('.home-incredible-block__item').forEach(el => {
  const offset = 50;
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



function mobileIncredibleBlockSlider() {
  if (window.screen.width > 600) return;
  const incredibleBlock = document.querySelector('[data-incredible-block-mobile-slider]');
  const swiper = new Swiper(incredibleBlock, {
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
    document.querySelector('[data-incredible-block-mobile-current]').textContent = pad(swiper.realIndex);
  });
}

mobileIncredibleBlockSlider();



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

document.querySelectorAll('.home-about-screen__bg, .home-location-screen__bg, .home-advantages-block__bg').forEach(el => {
  homeParalax(el);
});



gsap.timeline({
  scrollTrigger: {
    trigger: '.home-front-screen',
    start: 'top top',
    scrub: 1,
  }
})
  .fromTo('.home-front-screen__bg img', { scale: 1 }, { scale: 1.05, clearProps: 'all' })
  .fromTo('.home-front-screen__bg', { y: 0 }, { y: document.documentElement.clientHeight * 0.25, clearProps: 'all' }, '<');