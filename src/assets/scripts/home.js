import Swiper from 'swiper';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/all';
import Headroom from 'headroom.js';
import { lenis } from './modules/scroll/leniscroll';


const header = document.querySelector('.header');

const headroom = new Headroom(header, {});
headroom.init();

gsap.registerPlugin(ScrollTrigger);


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

applyScrollTriggerAnimation('.home-incredible-block__item, .home-advantages-block__title, .home-location-screen__slogan, .home-location-screen__light, .home-about-screen__items');


const advblock2 = new Swiper('[data-home-advantages-block2]', {
    slidesPerView: 3.1,
})