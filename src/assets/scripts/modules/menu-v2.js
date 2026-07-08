// ============================================================
//  NEW MENU (menu-v2) controller.
//  Повністю незалежний від старого меню (modules/menu.js та
//  логіки в index-app.js). Нічого старого не чіпає.
//
//  Анімація відкриття/закриття зроблена схожою на старе меню:
//  «шторка» через clip-path (зверху вниз) + каскадна поява
//  посилань (fade + зсув по Y) на GSAP.
//
//  Тригер відкриття/закриття: [data-menu-v2-call] (кнопка МЕНЮ).
//  Додаткове закриття: [data-menu-v2-close], клавіша Escape.
// ============================================================

import { gsap } from 'gsap';

const menu = document.querySelector('[data-menu-v2]');

if (menu) {
  const header = document.querySelector('.header');
  const links = menu.querySelectorAll('.menu-v2__link');

  // clip-path «шторки»: згорнута під верхньою гранню -> розгорнута на всю висоту
  const CLIP_HIDDEN = 'polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%)';
  const CLIP_SHOWN = 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)';

  // Меню стартує одразу під реальним хедером — рахуємо його висоту,
  // бо на різних брейкпоінтах вона різна.
  const syncOffsets = () => {
    if (header) {
      menu.style.setProperty('--menu-v2-top', `${header.offsetHeight}px`);
    }
    const vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh', `${vh}px`);
  };

  const openTl = gsap
    .timeline({ paused: true })
    .add(() => menu.classList.add('is-open'))
    .fromTo(
      menu,
      { clipPath: CLIP_HIDDEN },
      {
        clipPath: CLIP_SHOWN,
        ease: 'power2.out',
        duration: 1,
        clearProps: 'clipPath',
      },
    )
    .fromTo(
      links,
      { opacity: 0, y: -20 },
      { opacity: 1, y: 0, ease: 'power2.out', duration: 0.9, stagger: 0.06 },
      '<',
    );

  const closeTl = gsap
    .timeline({ paused: true })
    .fromTo(
      links,
      { opacity: 1, y: 0 },
      { opacity: 0, y: -20, ease: 'power2.in', duration: 0.4, stagger: 0.03 },
    )
    .fromTo(
      menu,
      { clipPath: CLIP_SHOWN },
      { clipPath: CLIP_HIDDEN, ease: 'power2.in', duration: 0.6 },
      '<0.1',
    )
    .add(() => menu.classList.remove('is-open'));

  let opened = false;

  const open = () => {
    opened = true;
    syncOffsets();
    closeTl.pause();
    openTl.restart();
    menu.setAttribute('aria-hidden', 'false');
    document.body.classList.add('popup-open');
  };

  const close = () => {
    opened = false;
    openTl.pause();
    closeTl.restart();
    menu.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('popup-open');
  };

  const toggle = () => (opened ? close() : open());

  document.body.addEventListener('click', evt => {
    const trigger = evt.target.closest('[data-menu-v2-call]');
    if (trigger) {
      evt.preventDefault();
      toggle();
    }
  });

  document.body.addEventListener('click', evt => {
    if (evt.target.closest('[data-menu-v2-close]')) {
      close();
    }
  });

  document.addEventListener('keyup', evt => {
    if (evt.key === 'Escape' && opened) {
      close();
    }
  });

  window.addEventListener('resize', () => {
    if (opened) syncOffsets();
  });
}
