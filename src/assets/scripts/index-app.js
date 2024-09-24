import './modules/form';
import { useState } from './modules/helpers/helpers';


//data-popup

const [formPopup, setFormPopup, useSetPopupEffect ] = useState(false);

useSetPopupEffect(val => {
    const popup = document.querySelector('[data-popup]');
    popup.classList.toggle('active', val);
    document.body.classList.toggle('popup-open', val);
});

document.body.addEventListener('click', (evt) => {
    const target = evt.target.closest('[data-popup-call]');
    if (target){
        setFormPopup(true);

    }
});
document.body.addEventListener('click', (evt) => {
    const target = evt.target.closest('[data-popup-close]');
    if (target || evt.target.classList.contains('popup')) {
        setFormPopup(false);
    }
});