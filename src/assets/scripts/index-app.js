import gsap from 'gsap/all';
import './modules/form';
import { lenis } from './modules/scroll/leniscroll';

// 1. Отримуємо посилання на Lenis (переконайтеся, що змінна доступна глобально)
// const lenis = new Lenis();

// 2. Слухаємо window, а не wrapper
const wrapper = document.querySelector('.home-module-screen__frame');
const sensor = document.getElementById('iframe-sensor');

if (sensor && wrapper) {
  // 1. Обробка скролу через сенсор
  sensor.addEventListener(
    'wheel',
    e => {
      e.preventDefault(); // Забороняємо браузеру стандартну дію

      // Передаємо скрол в Lenis
      // На ноутбуках deltaY може бути малим, Lenis сам його згладить
      lenis.scrollTo(lenis.scroll + e.deltaY, {
        immediate: false,
        force: true,
      });
    },
    { passive: false },
  );

  // 2. Активація взаємодії при кліку
  sensor.addEventListener('click', () => {
    wrapper.classList.add('is-active');
    console.log('Interaction mode: ON');
  });

  // 3. ПОВЕРНЕННЯ в режим скролу, коли миша пішла геть
  wrapper.addEventListener('mouseleave', () => {
    wrapper.classList.remove('is-active');
    console.log('Interaction mode: OFF (Scroll active)');
  });
}
//data-popup

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
      console.log('focus on name', nameInput);
    }, 300);
  } else {
    if (nameInput) nameInput.blur();
  }
  document.body.classList.toggle('popup-open', val);
});

document.body.addEventListener('click', evt => {
  const target = evt.target.closest('[data-popup-call]');
  if (target) {
    setFormPopup(true);
  }
});
document.body.addEventListener('click', evt => {
  const target = evt.target.closest('[data-popup-close]');
  if (target || evt.target.classList.contains('popup')) {
    setFormPopup(false);
  }
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

useSetMenuEffect(val => {
  const menu = document.querySelector('[data-menu]');
  let tl = gsap.timeline({
    paused: true,
  });
  if (val) {
    tl.add(() => {
      menu.classList.toggle('active', val);
    })
      .fromTo(
        '.menu__list, .menu__image, .menu__contacts',
        {
          clipPath: 'polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%)',
          // opacity: 0,
        },
        {
          // opacity: 1,
          clipPath: 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)',
          stagger: 0.1,
          ease: 'power2.out',
          duration: 1,
          clearProps: 'clipPath',
        },
      )
      .fromTo(
        '[data-menu] .menu__link',
        {
          opacity: 0,
          y: -20,
        },
        {
          opacity: 1,
          y: 0,
          ease: 'power2.out',
          duration: 1,
          stagger: 0.1,
        },
        '<',
      )
      .fromTo(
        '[data-menu] .menu__close',
        {
          opacity: 0,
          y: -20,
        },
        {
          opacity: 1,
          y: 0,
          ease: 'power2.out',
          duration: 1,
        },
        '<+0.5',
      );
  } else {
    tl.fromTo(
      '[data-menu]>*:not(.menu__close)',
      {
        clipPath: 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)',
      },
      {
        clipPath: 'polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%)',
        stagger: 0.1,
        ease: 'power2.out',
        duration: 0.5,
      },
    )
      .fromTo(
        '[data-menu] .menu__link',
        {
          opacity: 1,
          y: 0,
        },

        {
          opacity: 0,
          y: -20,
          ease: 'power2.out',
          duration: 0.5,
          stagger: 0.1,
        },
        '<',
      )
      .add(() => {
        menu.classList.toggle('active', val);
      }, '<+0.5');
  }
  tl.play();
  if (val) {
    const vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh', `${vh}px`);
  }
  document.body.classList.toggle('popup-open', val);
});

document.body.addEventListener('click', evt => {
  const target = evt.target.closest('[data-menu-call]');
  if (target) {
    setMenuState(true);
  }
});

document.body.addEventListener('click', evt => {
  const target = evt.target.closest('[data-menu-close]');
  if (target || evt.target.classList.contains('menu')) {
    setMenuState(false);
  }
});

document.querySelectorAll('[data-up-arrow]').forEach(el => {
  el.addEventListener('click', () => {
    window.scrollTo({ top: 0 });
  });
});
