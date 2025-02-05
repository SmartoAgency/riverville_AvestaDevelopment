import Swiper, { Mousewheel, Navigation } from 'swiper';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/all';
import Headroom from 'headroom.js';
import { lenis } from './modules/scroll/leniscroll';
import { useState } from './modules/helpers/helpers';
import splitToLinesAndFadeUp from './modules/effects/splitLinesAndFadeUp';
import { speed } from 'jquery';
import gallerySlider from './modules/gallery/gallerySlider';

const header = document.querySelector('.header');

const headroom = new Headroom(header, {});
headroom.init();

gsap.registerPlugin(ScrollTrigger);
gsap.core.globals('ScrollTrigger', ScrollTrigger);


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
                { y: 100, autoAlpha: 0 },
                { y: 0, autoAlpha: 1, clearProps: 'all', duration: 1.25, ease: 'power4.out', stagger: 0.1 },
            );
    });
}

applyScrollTriggerAnimation('.about-block-with-render3__content, .about-img-text__content, .about-img-text__img-wrap, .about-block-with-render2__content, .about-block-with-render1__content');



function blockWithRenderParalax(container) {
    gsap.timeline({
        scrollTrigger: {
            trigger: container,
            scrub: true,
            end: '100% top'
        }
    }).from(container.querySelector('img'), {
        scale: 1.2,
        transformOrigin: 'top',
    }).to(container, {
        y: -100,
        transformOrigin: 'bottom',
    }, '<');
}

document.querySelectorAll('.about-block-with-render1__bg, .about-block-with-render2__bg, .about-block-with-render3__bg').forEach(el => {
    blockWithRenderParalax(el);
});

splitToLinesAndFadeUp(
  '[data-split-lines-and-fade-up]',
  gsap,
);


function blockImgTextParalax() {
    const container = document.querySelector('.about-img-text__img-wrap');

    gsap.timeline({
        scrollTrigger: {
            trigger: container,
            scrub: true,
            end: '100% top'
        }
    }).from(container.querySelector('img'), {
        scale: 1.1,
    }).fromTo(container.querySelector('.about-img-text__img'), {
        y: 50,
    }, {
        y: -50
    },'<');
}

blockImgTextParalax();