// Асинхронні чанки webpack вантажить відносно output.publicPath. Задати його
// статично не можна: локально бандли лежать за /assets/scripts/, а на проді —
// за /wp-content/themes/3d/assets/scripts/. Порожній publicPath теж не годиться,
// бо тоді шлях резолвиться відносно URL сторінки (/about/form.bundle.js → 404).
// Тому визначаємо каталог у рантаймі з тега <script>, яким завантажили сам бандл.
//
// Модуль має імпортуватись ПЕРШИМ у точці входу — до будь-якого import().
const currentScript =
  document.currentScript ||
  document.querySelector('script[src*="index.bundle.js"]') ||
  document.querySelector('script[src*=".bundle.js"]');

if (currentScript && currentScript.src) {
  // відкидаємо ім'я файла і ?ver=…, лишається каталог зі слешем на кінці
  // eslint-disable-next-line camelcase, no-undef
  __webpack_public_path__ = currentScript.src.split('?')[0].replace(/[^/]+$/, '');
}
