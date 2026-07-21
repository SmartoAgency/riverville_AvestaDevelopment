import { gsap } from 'gsap';
import './modules/form';
import './modules/menu-v2';
import { lenis } from './modules/scroll/leniscroll';

const wrapper = document.querySelector('.home-module-screen__frame');
const sensor = document.getElementById('iframe-sensor');
const lazyIframe = wrapper && wrapper.querySelector('iframe[data-src]');

if (lazyIframe) {
  const iframeObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          lazyIframe.src = lazyIframe.dataset.src;
          observer.unobserve(lazyIframe);
        }
      });
    },
    { rootMargin: '200px' },
  );

  iframeObserver.observe(lazyIframe);
}

if (sensor && wrapper) {
  sensor.addEventListener(
    'wheel',
    e => {
      e.preventDefault();
      lenis.scrollTo(lenis.scroll + e.deltaY, {
        immediate: false,
        force: true,
      });
    },
    { passive: false },
  );

  sensor.addEventListener('click', () => {
    wrapper.classList.add('is-active');
  });

  wrapper.addEventListener('mouseleave', () => {
    wrapper.classList.remove('is-active');
  });
}

function useState(initialValue) {
  let value = initialValue;
  const subscribers = [];

  function setValue(newValue) {
    value = newValue;
    subscribers.forEach(subscriber => subscriber(value));
  }

  function getState() {
    return value;
  }

  function subscribe(callback) {
    subscribers.push(callback);
    return () => {
      const index = subscribers.indexOf(callback);
      if (index !== -1) {
        subscribers.splice(index, 1);
      }
    };
  }

  return [getState, setValue, subscribe];
}

const [formPopup, setFormPopup, useSetPopupEffect] = useState(false);

useSetPopupEffect(val => {
  const popup = document.querySelector('[data-popup]');
  popup.classList.toggle('active', val);
  const nameInput = document.querySelector(
    '[data-popupn-form] .contact-screen-form__group input[name="name"]',
  );

  if (popup.classList.contains('active')) {
    setTimeout(() => {
      if (nameInput) nameInput.focus();
    }, 300);
  } else {
    if (nameInput) nameInput.blur();
  }
  document.body.classList.toggle('popup-open', val);
});

document.body.addEventListener('click', evt => {
  const target = evt.target.closest('[data-popup-call]');
  if (target) setFormPopup(true);
});

document.body.addEventListener('click', evt => {
  const target = evt.target.closest('[data-popup-close]');
  if (target || evt.target.classList.contains('popup')) setFormPopup(false);
});

const vh = window.innerHeight * 0.01;
document.documentElement.style.setProperty('--vh', `${vh}px`);

window.addEventListener('resize', () => {
  if (window.screen.width < 600) return;
  const vh = window.innerHeight * 0.01;
  document.documentElement.style.setProperty('--vh', `${vh}px`);
});

const [menuState, setMenuState, useSetMenuEffect] = useState(false);

document.addEventListener('keyup', evt => {
  if (evt.key === 'Escape' && menuState()) {
    setMenuState(false);
    setFormPopup(false);
  }
});

// Timeline створюється один раз
const menu = document.querySelector('[data-menu]');

const menuOpenTl = gsap.timeline({ paused: true })
  .add(() => menu.classList.add('active'))
  .fromTo(
    '.menu__list, .menu__image, .menu__contacts',
    { clipPath: 'polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%)' },
    {
      clipPath: 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)',
      stagger: 0.1,
      ease: 'power2.out',
      duration: 1,
      clearProps: 'clipPath',
    },
  )
  .fromTo(
    '[data-menu] .menu__link',
    { opacity: 0, y: -20 },
    { opacity: 1, y: 0, ease: 'power2.out', duration: 1, stagger: 0.1 },
    '<',
  )
  .fromTo(
    '[data-menu] .menu__close',
    { opacity: 0, y: -20 },
    { opacity: 1, y: 0, ease: 'power2.out', duration: 1 },
    '<+0.5',
  );

const menuCloseTl = gsap.timeline({ paused: true })
  .fromTo(
    '[data-menu]>*:not(.menu__close)',
    { clipPath: 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)' },
    {
      clipPath: 'polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%)',
      stagger: 0.1,
      ease: 'power2.out',
      duration: 0.5,
    },
  )
  .fromTo(
    '[data-menu] .menu__link',
    { opacity: 1, y: 0 },
    { opacity: 0, y: -20, ease: 'power2.out', duration: 0.5, stagger: 0.1 },
    '<',
  )
  .add(() => menu.classList.remove('active'), '<+0.5');

useSetMenuEffect(val => {
  if (val) {
    menuCloseTl.pause(0);
    menuOpenTl.restart();
    const vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh', `${vh}px`);
  } else {
    menuOpenTl.pause();
    menuCloseTl.restart();
  }
  document.body.classList.toggle('popup-open', val);
});

document.body.addEventListener('click', evt => {
  const target = evt.target.closest('[data-menu-call]');
  if (target) setMenuState(true);
});

document.body.addEventListener('click', evt => {
  const target = evt.target.closest('[data-menu-close]');
  if (target || evt.target.classList.contains('menu')) setMenuState(false);
});

document.querySelectorAll('[data-up-arrow]').forEach(el => {
  el.addEventListener('click', () => {
    window.scrollTo({ top: 0 });
  });
});

function initAccordions() {
  const accordions = document.querySelectorAll('[data-accordion]');
  if (accordions.length === 0) return;

  accordions.forEach(accordion => {
    const title = accordion.querySelector('[data-accordion-title]');
    if (!title) return;

    title.addEventListener('click', () => {
      const isOpen = accordion.classList.toggle('accordion_open');
      title.setAttribute('aria-expanded', isOpen);
    });
  });
}

document.addEventListener('DOMContentLoaded', initAccordions);