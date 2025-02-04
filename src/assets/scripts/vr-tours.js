import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useState } from './modules/helpers/helpers';

gsap.registerPlugin(ScrollTrigger);
gsap.core.globals('ScrollTrigger', ScrollTrigger);

const [ tab, setTab, useTabEffect] = useState(null);

const [ tabInfo, setTabInfo, useTabInfoEffect ] = useState({});

useTabInfoEffect((info) => {
    const title = document.querySelector('[data-vr-tour-title]');
    const description = document.querySelector('[data-vr-tour-description]');
    const url = document.querySelector('[data-vr-tour-url]');

    gsap.timeline()
        .fromTo([title, description, url], {
            opacity: 1,
            x: 0,
        }, {
            opacity: 0,
            x: 25,
        })
        .add(() => {
            document.querySelector('[data-vr-tour-title]').textContent = info.title;
            document.querySelector('[data-vr-tour-description]').textContent = info.description;
            document.querySelector('[data-vr-tour-url]').onload = () => {
                gsap.fromTo('[data-vr-tour-url]', {
                    opacity: 0,
                    x: -25,
                }, {
                    opacity: 1,
                    x: 0,
                })
            }
            document.querySelector('[data-vr-tour-url]').src = info.url;
        },'+0.5')
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


setTab(document.querySelectorAll('[data-vr-tour-tab]')[0].dataset.vrTourTab);


document.body.addEventListener('click', (e) => {
    const target = e.target.closest('[data-vr-tour-tab]');
    if (!target) return;
    setTab(target.dataset.vrTourTab);
});

/*
data-vr-tour-title
data-vr-tour-description
data-vr-tour-url
*/