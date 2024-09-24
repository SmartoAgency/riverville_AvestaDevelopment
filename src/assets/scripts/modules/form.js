import i18next from 'i18next';
import { gsap } from 'gsap';
import * as yup from 'yup';
// eslint-disable-next-line import/no-extraneous-depende
import FormMonster from '../../../pug/components/form/form';
import SexyInput from '../../../pug/components/input/input';
import { useState } from './helpers/helpers';


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
                color: #7b9d45;
              ">
              
                <div style="text-align: center; margin-bottom: 10px"  class="text-uppercase">
                  ЗАЯВКУ НА ЗДІЙСНЕНЯ МРІЇ ПРИЙНЯТО! СКОРО З ВАМИ ЗВ'ЯЖЕТЬСЯ ВАШ ПЕРСОНАЛЬНИЙ ПОРАДНИК 
                </div>
                <button data-form-popup-close type="button" onclick="this.closest('[data-success]').remove()" class="button-30 button-30--blue">Закрити</button>
              
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


const [fromPopup, setFormPopup, useSetPopupEffect ] = useState(false);

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