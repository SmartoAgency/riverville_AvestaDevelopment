import './modules/public-path';
import gsap from 'gsap';
import { useState } from './modules/helpers/helpers';
import { onEnterView } from './modules/helpers/defer';

const [ tab, setTab, useTabEffect] = useState(null);

const [ tabInfo, setTabInfo, useTabInfoEffect ] = useState({});

// Анімуємо ТІЛЬКИ текст. Раніше в ці ж твіни підмішувався сам iframe туру
// (opacity + x), а всередині нього крутиться WebGL-панорама (pannellum).
// Анімація opacity/transform на такому iframe змушує браузер перерастеризовувати
// його шар кожен кадр — і робить це двічі за перемикання вкладки (згасання
// + поява по onload). Саме звідси в Lighthouse бралися тисячі мілісекунд
// Total CPU Time, приписані vendors.bundle.js (там лежить gsap), яких немає
// на жодній іншій сторінці — бо тільки тут gsap анімує живий WebGL-шар.
useTabInfoEffect((info) => {
    const title = document.querySelector('[data-vr-tour-title]');
    const description = document.querySelector('[data-vr-tour-description]');
    const frame = document.querySelector('[data-vr-tour-url]');

    gsap.timeline()
        .fromTo([title, description], {
            opacity: 1,
            x: 0,
        }, {
            opacity: 0,
            x: 25,
        })
        .add(() => {
            title.textContent = info.title;
            description.textContent = info.description;
            if (frame) frame.src = info.url;
        }, '+0.5')
        .fromTo([title, description], {
            opacity: 0,
            x: -25
        }, {
            opacity: 1,
            x: 0,
        })

});

useTabEffect((tab) => {
    document.querySelectorAll('[data-vr-tour-tab]').forEach((el) => {
        const dataset = el.dataset.vrTourTab;
        el.classList.toggle('active', dataset === tab);
    });

    const activeTab = document.querySelector('[data-vr-tour-tab].active');
    const title = activeTab.dataset.title;
    const description = activeTab.dataset.description;
    const url = activeTab.dataset.url;
    setTabInfo({
        title,
        description,
        url,
    });
});


const vrTabs = document.querySelectorAll('[data-vr-tour-tab]');
const vrFrame = document.querySelector('[data-vr-tour-url]');

if (vrTabs.length) {
    const initFirstTour = () => {
        if (!tab()) setTab(vrTabs[0].dataset.vrTourTab);
    };

    // Перший тур не вантажимо на старті: youtube-embed тягне важкий сторонній
    // плеєр і додає роботи в критичний кадр (ТЗ 3.5.2.2). Чекаємо, поки блок
    // туру наблизиться до вьюпорта. Клік по вкладці — явний намір користувача,
    // тому там src проставляється одразу (через setTab нижче).
    if (vrFrame) {
        onEnterView(vrFrame, initFirstTour, { rootMargin: '600px 0px' });
    } else {
        initFirstTour();
    }
}


document.body.addEventListener('click', (e) => {
    const target = e.target.closest('[data-vr-tour-tab]');
    if (!target) return;
    setTab(target.dataset.vrTourTab);
});

// ScrollTrigger тут завантажувався і реєструвався, але жодна анімація сторінки
// його не використовувала — у файлі немає жодного scrollTrigger: у конфігах.
// Прибрано: /vr-tours/ більше не тягне чанк gsap-scroll узагалі.

/*
data-vr-tour-title
data-vr-tour-description
data-vr-tour-url
*/
