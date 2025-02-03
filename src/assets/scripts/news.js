import gsap from "gsap";
import { useState } from "./modules/helpers/helpers";
import getNews from "./modules/news/getNews";


const [ tab, setTab, useTabEffect ] = useState(0);
const [ news, setNews, useNewsEffect ] = useState([]);

useTabEffect((currentTab) => {
    document.querySelectorAll('[data-tab]').forEach((el, index) => {
        const value = el.getAttribute('data-tab');
        el.classList.toggle('active', value === currentTab);
    });
});

useTabEffect((currentTab) => {
    gsap.timeline()
        .fromTo('.news-card', { opacity: 1 }, { opacity: 0, duration: 0.3, stagger: 0.1 })
        .add(() => {
            getNews(currentTab)
                .then((response) => {
                    setNews(response.data);
                })
        })
});

useNewsEffect(data => {
    console.log(data);
    const container = document.querySelector('[data-news-container]');
    gsap.timeline()
        .fromTo(container, { opacity: 1 }, { opacity: 0, duration: 0.3 })
        .add(() => {
            container.innerHTML = data.map(newsCard).join('');
        })
        .add(() => {
            gsap.timeline()
                .fromTo(container, { opacity: 0 }, { opacity: 1, duration: 0.3 })
                .fromTo('.news-card', { opacity: 0 }, { opacity: 1, duration: 0.3, stagger: 0.1 })
        });
    
})

setTab('all');

document.body.addEventListener('click', (e) => {
    const target = e.target.closest('[data-tab]');
    if (target) {
        setTab(target.getAttribute('data-tab'));
    }
});


function newsCard(data) {
    return `
        <a class="news-card" href="${data.href}">
            <div class="news-card__image">
                <img src="${data.image}" alt="" srcset="" loading="lazy">
            </div>
            <div class="news-card__content">
                <div class="news-card__date text-style-1920-button">${data.date}</div>
                <div class="news-card__title text-style-1920-h-4">${data.title}</div>
            </div>
        </a>
    `;
}