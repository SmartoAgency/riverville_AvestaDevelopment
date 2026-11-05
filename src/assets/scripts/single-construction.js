import './modules/public-path';
import { onEnterView } from './modules/helpers/defer';

function pad(d) {
    return (d < 10) ? '0' + d.toString() : d.toString();
}

// Swiper — важкий async-чанк, а слайдер сторінки ходу будівництва не в першому
// екрані. Раніше import('swiper') висів на верхньому рівні модуля, тож чанк
// тягнувся і new Swiper() виконувався одразу на завантаженні — прямий внесок
// у TBT (ТЗ 3.5.2.2). Тепер ініціалізуємо, лише коли слайдер наближається до
// вьюпорта. Немає слайдера на сторінці — onEnterView просто нічого не робить.
const slider = document.querySelector('[data-single-news-slider]');

onEnterView(slider, () => {
    import(/* webpackChunkName: "swiper" */ 'swiper').then(({ default: Swiper, Navigation }) => {
        new Swiper('[data-single-news-slider]', {
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
    });
});
