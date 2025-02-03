import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/all';
import { lenis } from './modules/scroll/leniscroll';


gsap.registerPlugin(ScrollTrigger);


gsap.timeline({
    defaults: {
        duration: 1,
        ease: 'none'
    },
    scrollTrigger: {
        trigger: '.infrastructure-block-with-render__bg',
        scrub: true,
        start: '50% 50%',
    }
})
    .fromTo('.infrastructure-block-with-render__decor path', {
        x: -80,
    }, {
        x: 80,
    })
    .fromTo('.infrastructure-block-with-render__bg img', {
        scale: 1
    }, {
        scale: 1.2
    }, '<')
gsap.timeline({
    scrollTrigger: {
        trigger: '.infrastructure-block-with-render2__bg',
        scrub: true,
        start: '50% 50%'
    }
})
    .fromTo('.infrastructure-block-with-render2__bg img', {
        scale: 1
    }, {
        scale: 1.2
    }, '<')



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
    
    applyScrollTriggerAnimation('.infrastructure-grid__card-title');


gsap.timeline({
    scrollTrigger: {
        trigger: '.infrastructure-grid',
        start: '0% bottom',
        end: '40% bottom',
        scrub: true,
    }
})
    .fromTo('.infrastructure-grid>:nth-child(-n+3)', 
        { y: 50, autoAlpha: 0,  }, 
        { y: 0, autoAlpha: 1, duration: 1.25, stagger: 0.15 })
gsap.timeline({
    scrollTrigger: {
        trigger: '.infrastructure-grid',
        start: '50% bottom',
        end: '90% bottom',
        scrub: true,
    }
})
    .fromTo('.infrastructure-grid>:nth-child(n+4)', 
        { y: 50, autoAlpha: 0,  }, 
        { y: 0, autoAlpha: 1, duration: 1.25, stagger: -0.15 })