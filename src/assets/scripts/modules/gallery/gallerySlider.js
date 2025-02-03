import { useState } from "../helpers/helpers";

export default function gallerySlider(gsap, Swiper) {
    const [galleryClosed, setGalleryClosed, subscribeGalleryClosed] = useState(true);

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
}