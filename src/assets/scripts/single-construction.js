import Swiper, { Navigation } from 'swiper';


const slider = new Swiper('[data-single-news-slider]', {
    modules: [Navigation],
    spaceBetween: 8,
    slidesPerView: 1,
    slideToClickedSlide: true,
    navigation: {
        prevEl: '[data-single-news-slider-prev]',
        nextEl: '[data-single-news-slider-next]',
    },
    on: {
        init: (e) => {
            document.querySelector('[data-single-news-slider-all]').textContent = pad(e.slides.length);
        },
        slideChange: (e) => {
            document.querySelector('[data-single-news-slider-current]').textContent = pad(e.realIndex + 1);
        }
    }
});


function pad(d) {
    return (d < 10) ? '0' + d.toString() : d.toString();
}