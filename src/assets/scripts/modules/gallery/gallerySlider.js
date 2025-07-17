import { useState } from "../helpers/helpers";

export default function gallerySlider(gsap, Swiper) {
    const [galleryClosed, setGalleryClosed, subscribeGalleryClosed] = useState(true);
    let isInViewport = false;

    subscribeGalleryClosed(value => {
        const gallery = document.querySelector('[data-home-gallery-screen]');
        gallery.classList.toggle('closed', value);
    });

    setGalleryClosed(true);

    const gallery = new Swiper('[data-home-gallery-screen-swiper]', {
        speed: 1000,
        navigation: {
            nextEl: '[data-home-gallery-screen-next]',
            prevEl: '[data-home-gallery-screen-prev]',
        },
        on: {
            init(instance) {
                document.querySelector('[data-home-gallery-screen-pagination-all]').textContent =
                    instance.slides.length;
                document.querySelector('[data-home-gallery-screen-pagination-current]').textContent =
                    instance.realIndex + 1;
            },
            slideChange(instance) {
                document.querySelector('[data-home-gallery-screen-pagination-current]').textContent =
                    instance.realIndex + 1;
            },
        },
    });

    if (window.screen.width <= 1024) {
        setGalleryClosed(false);
        return;

    }

    gsap.timeline({
        scrollTrigger: {
            trigger: '[data-home-gallery-screen]',
            start: '80% bottom',
            onEnter() {
                setGalleryClosed(false);
            },
            onLeaveBack() {
                setGalleryClosed(true);
            },
        },
    });

    trackVisibility('[data-home-gallery-screen]', (action, target) => {        
        if (action === 'enter') {
            isInViewport = true;
        } else {
            isInViewport = false;
        }
    });

    document.addEventListener('keyup', (evt) => {        
        if (!isInViewport) return;
        switch (evt.key) {
            case 'ArrowLeft':
                gallery.slidePrev();
                break;
            case 'ArrowRight':
                gallery.slideNext();
                break;
            default:
                break;
        }
    })
}


function trackVisibility(targetSelector, callback) {
    const target = document.querySelector(targetSelector);
    if (!target) {
        console.warn(`Елемент ${targetSelector} не знайдено.`);
        return;
    }

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                callback('enter', entry.target);
            } else {
                callback('exit', entry.target);
            }
        });
    }, {
        threshold: 0.1 // 10% елемента видно — вважається в зоні видимості
    });

    observer.observe(target);
}