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

    // Перемикач категорій. Активується лише там, де є вкладки (сторінка /gallery/),
    // на решті сторінок — тихо не робить нічого. Повертає true, якщо перемикач є.
    const hasCategories = setupGalleryCategories(gallery);

    if (window.screen.width <= 1024) {
        setGalleryClosed(false);
        return;

    }

    if (hasCategories) {
        // Сторінка /gallery/: слайдер завжди відкритий, без home-ефекту розкриття
        // по скролу (scale/translate). Інакше перепризначення активного слайда
        // під час перемикання категорій щоразу програє анімацію розкриття.
        setGalleryClosed(false);
    } else {
        // Головна: слайдер «розкривається» при доскролюванні до нього
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


// Фільтрація слайдів галереї за категоріями.
// Слайди фізично лишаються/вилучаються з DOM, після чого swiper.update()
// перечитує вміст .swiper-wrapper — тому лічильник і навігація коректні.
function setupGalleryCategories(swiper) {
    const root = document.querySelector('.home-gallery-screen');
    if (!root) return false;

    const tabs = Array.from(root.querySelectorAll('[data-gallery-category]'));
    const wrapper = root.querySelector('.swiper-wrapper');
    if (!tabs.length || !wrapper) return false;

    // Повний, незмінний набір слайдів (посилання на вузли зберігаються навіть після вилучення з DOM)
    const allSlides = Array.from(wrapper.querySelectorAll('.swiper-slide'));
    const currentEl = document.querySelector('[data-home-gallery-screen-pagination-current]');
    const totalEl = document.querySelector('[data-home-gallery-screen-pagination-all]');

    // Тривалість плавного згасання/появи (має збігатися з CSS-транзишеном .swiper)
    const FADE_MS = 300;
    let switchTimer = null;

    const applyCategory = (category) => {
        const matched = category === 'all'
            ? allSlides
            : allSlides.filter((slide) => slide.dataset.category === category);

        // 1) плавно ховаємо поточні слайди
        swiper.el.classList.add('is-switching');
        if (switchTimer) clearTimeout(switchTimer);

        // 2) поки слайдер невидимий — підміняємо слайди й скидаємо позицію,
        //    3) після чого плавно показуємо нові
        switchTimer = setTimeout(() => {
            // лишаємо у слайдері тільки слайди обраної категорії, зберігаючи вихідний порядок
            allSlides.forEach((slide) => slide.remove());
            matched.forEach((slide) => wrapper.appendChild(slide));

            swiper.update();
            swiper.slideTo(0, 0);

            if (totalEl) totalEl.textContent = matched.length;
            if (currentEl) currentEl.textContent = matched.length ? 1 : 0;

            swiper.el.classList.remove('is-switching');
        }, FADE_MS);
    };

    tabs.forEach((tab) => {
        tab.addEventListener('click', () => {
            if (tab.disabled || tab.classList.contains('is-active')) return;
            tabs.forEach((item) => item.classList.remove('is-active'));
            tab.classList.add('is-active');
            applyCategory(tab.dataset.galleryCategory);
        });
    });

    return true;
}