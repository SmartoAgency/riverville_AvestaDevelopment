import i18next from 'i18next';
import { gsap } from 'gsap';
import * as yup from 'yup';
// eslint-disable-next-line import/no-extraneous-depende
import FormMonster from '../../../pug/components/form/form';
import SexyInput from '../../../pug/components/input/input';


/*
 * form handlers start
 */
const forms = [
    '[data-popupn-form]',
    '[data-contact-screen-form]'
  ];
  console.log('ffff');
  forms.forEach((form) => {
    const $form = document.querySelector(form);
    if ($form) {
      /* eslint-disable */
      new FormMonster({
        /* eslint-enable */
        elements: {
          $form,
          successAction: () => { 
            $form.insertAdjacentHTML('beforeend', `
              <div data-success style="
                position: absolute;
                left: 0;
                top: 0;
                width: 100%;
                height: 100%;
                background-color: var(--color-white);
                display: flex;
                align-items: center;
                justify-content: center;
                flex-direction: column;
                font-family: 'Inter Display';
                font-size: 21px;
                font-style: normal;
                line-height: 120%; /* 72px */
                text-transform: uppercase;
                z-index: 2;
                padding: 8px;
                padding-left: 40px;
                padding-right: 40px;
                color: rgba(7,34,47,1);
              ">
                <svg style="margin-bottom: 25px;" width="100" height="100" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M33.6375 86.5518C38.9766 89.3912 45.0699 91.0001 51.5389 91.0001C72.6248 91.0001 89.7183 73.9065 89.7183 52.8206C89.7183 31.7347 72.6248 14.6411 51.5389 14.6411C30.4529 14.6411 13.3594 31.7347 13.3594 52.8206C13.3594 62.3059 16.8183 70.9832 22.5437 77.6602L18.8704 89.7085L18.3102 91.5461L20.1368 90.9509L33.6375 86.5518Z" stroke="#14427C" stroke-width="2"/>
                  <path d="M48.7183 42.8206C48.7183 38.9102 45.4493 35.6411 41.5389 35.6411C37.6284 35.6411 34.3594 38.9102 34.3594 42.8206" stroke="#14427C" stroke-width="2"/>
                  <path d="M75.3852 42.8206C75.3852 38.9102 72.2329 35.6411 68.4621 35.6411C64.6914 35.6411 61.5391 38.9102 61.5391 42.8206" stroke="#14427C" stroke-width="2"/>
                  <path d="M63.0777 58.2053C63.0777 62.1157 59.8087 65.3848 55.8982 65.3848C51.9878 65.3848 48.7188 62.1157 48.7188 58.2053" stroke="#14427C" stroke-width="2"/>
                  <path d="M8.22657 21.168L10.6045 23.5459L16.0082 18.1422" stroke="#14427C" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  <path d="M87.1406 23.395L89.5186 25.7729L94.9222 20.3693" stroke="#14427C" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  <circle cx="80.385" cy="7.82051" r="3.82051" stroke="#14427C" stroke-width="2"/>
                  <circle cx="9.48653" cy="82.5642" r="3.82051" stroke="#14427C" stroke-width="2"/>
                  <circle cx="95.1291" cy="82.5642" r="3.82051" stroke="#14427C" stroke-width="2"/>
                </svg>
                <div style="padding-left: 40px; padding-right: 40px; text-align: center; margin-bottom: 10px;"  class="text-uppercase text-style-1920-h-2">
                  Повідомлення надіслано
                </div>
                <div class="text-style-1920-body" style="text-align: center; margin-bottom: 40px; max-width:500px; margin-left: auto; margin-right: auto; " >Дякуємо за звернення. Очікуйте дзвінка наших менеджерів. Бажаємо гарного дня та гарного настрою =)</div>
                <button data-form-popup-close type="button" onclick="this.closest('[data-success]').remove()" class="button-30 button-30--success-popup">
                  <span>Закрити</span>
                </button>
              
              </div>
            
            `);
            
            setTimeout(() => {
                // $form.querySelector('[data-success]').remove();
            }, 6000);
          },
          $btnSubmit: $form.querySelector('[data-btn-submit]'),
          fields: {
            name: {
              inputWrapper: new SexyInput({ animation: 'none', $field: $form.querySelector('[data-field-name]') }),
              rule: yup.string().required(i18next.t('required')).trim(),
              defaultMessage: i18next.t('name'),
              valid: false,
              error: [],
            },
  
            phone: {
              inputWrapper: new SexyInput({ animation: 'none', $field: $form.querySelector('[data-field-phone]'), typeInput: 'phone' }),
              rule: yup
                .string()
                .required(i18next.t('required'))
                .min(17, i18next.t('field_too_short', { cnt: 17 - 5 })),
  
              defaultMessage: i18next.t('phone'),
              valid: false,
              error: [],
            },
          },
  
        },
      });
    }
});


function useState(initialValue) {
  let value = initialValue;
  const subscribers = [];

  function setValue(newValue) {
    value = newValue;
    subscribers.forEach((subscriber) => subscriber(value));
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

const formState = useState(false);

// const [ fromPopup, setFormPopup, useSetPopupEffect ] = 
const fromPopup = formState[0];
const setFormPopup = formState[1];
const useSetPopupEffect = formState[2];

useSetPopupEffect(val => {
  if (val) {
    gsap.to('[data-form-popup]', {
      autoAlpha: 1,
      pointerEvents: 'all'
    });
    return;
  }
  gsap.to('[data-form-popup]', {
    autoAlpha: 0,
    pointerEvents: 'none'
  });
})


document.body.addEventListener('click', (evt) => {
  const target = evt.target.closest('[data-form-popup-call]');
  if (!target) return;
  setFormPopup(true);
})
document.body.addEventListener('click', (evt) => {
  const target = evt.target.closest('[data-form-popup-close]');
  if (!target) return;
  setFormPopup(false);
})