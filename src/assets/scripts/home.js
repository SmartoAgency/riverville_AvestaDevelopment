import Swiper, { Navigation } from 'swiper';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/all';
import Headroom from 'headroom.js';
import { lenis } from './modules/scroll/leniscroll';
import { useState } from './modules/helpers/helpers';
import splitToLinesAndFadeUp from './modules/effects/splitLinesAndFadeUp';


const header = document.querySelector('.header');

const headroom = new Headroom(header, {});
headroom.init();

gsap.registerPlugin(ScrollTrigger);


document.querySelectorAll('.home-front-screen__arrow').forEach((el) => {
    el.addEventListener('click', () => {
        document.querySelector('.home-about-screen').scrollIntoView({ behavior: 'smooth' });    
    });
});
document.querySelectorAll('[data-up-arrow]').forEach((el) => {
    el.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
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

    videoBtn.addEventListener('click', () => {
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
            }
        }
    })
}
screen1();

function applyScrollTriggerAnimation(selectors) {
    document.querySelectorAll(selectors).forEach((el) => {
        gsap.timeline({
            scrollTrigger: {
                trigger: el,
                start: '50% bottom',
                // end: 'bottom center',
                once: true,
            },
        })
            .fromTo(Array.from(el.children),
                { y: 25, autoAlpha: 0 },
                { y: 0, autoAlpha: 1, clearProps: 'all', duration: 1.25, ease: 'power4.out', stagger: 0.1 },
            );
    });
}

applyScrollTriggerAnimation('.contact-screen__table-item, .contact-screen .contact-screen-form, .home-sticky-block__item, .home-video-block__decor, .home-incredible-block__item, .home-advantages-block__title, .home-location-screen__slogan, .home-location-screen__light, .home-about-screen__items');


const advblock2 = new Swiper('[data-home-advantages-block2]', {
    slidesPerView: 3.1,
    breakpoints: {
        // when window width is >= 320px
        320: {
            slidesPerView: 1,
        },
        // when window width is >= 480px
        600: {
            slidesPerView: 2,
        },
        1024: {
            slidesPerView: 3.1,
        },
        // when window width is >= 640px
    }
})


const [ galleryClosed, setGalleryClosed, subscribeGalleryClosed ] = useState(true);


subscribeGalleryClosed((value) => {
    const gallery = document.querySelector('[data-home-gallery-screen]');
    gallery.classList.toggle('closed', value);
});

setGalleryClosed(true);

const gallery = new Swiper('[data-home-gallery-screen]', {
    modules: [Navigation],
    navigation: {
        nextEl: '[data-home-gallery-screen-next]',
        prevEl: '[data-home-gallery-screen-prev]',
    },
    on: {
        init(instance) {
            document.querySelector('[data-home-gallery-screen-pagination-all]').textContent = instance.slides.length;
            document.querySelector('[data-home-gallery-screen-pagination-current]').textContent = instance.realIndex + 1;
        },
        slideChange(instance) {
            document.querySelector('[data-home-gallery-screen-pagination-current]').textContent = instance.realIndex + 1;
        }
    },
});


gsap.timeline({
    scrollTrigger: {
        trigger: '[data-home-gallery-screen]',
        start: '80% bottom',
        onEnter() {
            setGalleryClosed(false);
        },
        onLeaveBack() {
            setGalleryClosed(true);
        }
    },
});



gsap.timeline({
    scrollTrigger: {
        trigger: '[data-wave1-block]',
        pin: '[data-wave1-block-content]',
        // end: '0% top',
        // endTrigger: '.home-news-screen',
        scrub: 1,
        markers: false,
    }
})
    .fromTo('[data-wave-block-top]', { y: 0 }, { y: window.screen.height * -0.5, ease: 'none' })
    .fromTo('[data-wave-block-bottom]', { y: 0 }, { y: window.screen.height * 0.5, ease: 'none' }, '<')


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
        { y: window.screen.width < 600 ? window.screen.height * -1 : window.screen.height * -0.5 }, 
        { y: 0, ease: 'none', duration: 0.75  }
    )
    .fromTo(
        '[data-wave2-block-bottom]', 
        { y: window.screen.width < 600 ? window.screen.height : window.screen.height * 0.5 }, 
        { y: 0, ease: 'none', duration: 0.75  }, 
        '<'
    )
    .to(
        '[data-wave2-block-bottom]', 
        { y: 0, ease: 'none', duration: 0.25 }
    )


gsap.timeline({
    scrollTrigger: {
        trigger: '.home-news-screen',
        start: '10% 50%',
        end: '20% 50%',
        markers: false,
        scrub: 1,
    }
})
    .fromTo('.home-news-screen__content', 
        {opacity: 0 }, 
        { opacity: 1, clearProps: 'all'});


        splitToLinesAndFadeUp('.home-location-screen__content .text-style-1920-body, .home-location-screen__title, .home-about-screen__title, .home-about-screen__subtitle, .home-advantages-block__title, .home-gallery-screen__title, .home-construction-screen__title', gsap);