import './modules/public-path';

/**
 * @typedef {Object} FlatImages
 * @property {Object} without
 * @property {string} without.2d - Шлях до 2D планування
 */

/**
 * @typedef {Object} LevelPhoto
 * @property {string} without - Посилання на фото рівня
 */

/**
 * @typedef {Object} RealEstateUnit
 * @property {string} id - Унікальний ID об'єкта
 * @property {string} build - ID будинку
 * @property {string} build_name - Назва ЖК
 * @property {string} section - Номер секції
 * @property {string} floor - Поверх
 * @property {string} rooms - Кількість кімнат (рядок)
 * @property {string} type - Тип квартири або "Комерція"
 * @property {string} number - Номер приміщення (напр. "п101")
 * @property {string} sale - Статус продажу (1 - вільно, 0 - продано, 2/3 - резерв)
 * @property {string} area - Загальна площа
 * @property {string} price - Форматована ціна (з пропусками)
 * @property {string} _price - Чиста ціна для розрахунків (String)
 * @property {string} price_m2 - Форматована ціна за м²
 * @property {number} _price_m2 - Число ціна за м²
 * @property {string} img_big - Пряме посилання на велике зображення
 * @property {string} img_small - Пняме посилання на прев'ю
 * @property {string} [3d_tour] - Посилання на 3D тур
 * @property {FlatImages} images - Об'єкт зображень
 * @property {Object.<string, LevelPhoto>} flat_levels_photo - Фото по рівнях
 * @property {string} sorts - Координати для мапи (SVG/Canvas)
 */

/**
 * ПОВНИЙ СПИСОК ОБ'ЄКТІВ НЕРУХОМОСТІ
 * @type {RealEstateUnit[]}
 */

/**
 * ГЕНЕРАЦІЯ МІКРОРОЗМІТКИ ItemList
 * @param {RealEstateUnit[]} filteredFlats 
 */

function updateItemListSchema(filteredFlats) {
  if (!filteredFlats) return;

  const h1Element = document.querySelector('h1');
  const listName = h1Element ? h1Element.innerText : "Каталог квартир";

  const schemaData = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": listName,
    "url": window.location.href,
    "numberOfItems": filteredFlats.length,
    "itemListElement": filteredFlats.map((flat, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": "Квартира №" + flat.number + ", секція " + flat.section + ", " + flat.rooms + "-кімнатна, " + flat.area + " м²"
    }))
  };

  let scriptTag = document.getElementById('item-list-schema');
  if (!scriptTag) {
    scriptTag = document.createElement('script');
    scriptTag.id = 'item-list-schema';
    scriptTag.type = 'application/ld+json';
    document.head.appendChild(scriptTag);
  }
  
  scriptTag.text = JSON.stringify(schemaData);
}

/**
 *
 * @param {string} label
 * @param {string|number} value
 * @returns {string}
 */

function RenderInfoRow(label, value) {
  return `
    <div class="flat-card__label-wrapper">
      <div class="flat-card__label">${label}:</div>
      <div class="flat-card__value">${value}</div>
    </div>
  `;
}

/**
 * @typedef {Object} FlatCardProps
 * @property {number|string} area
 * @property {number|string} price
 * @property {number|string} priceM2
 * @property {string} img
 * @property {number|string} number
 * @property {number|string} build
 * @property {number|string} section
 * @property {number|string} floor
 * @property {number|string} rooms
 * @property {number|string} id
 */

const ORIGIN = 'https://riverville.com.ua';

/**
 * Збирає посилання картки, щоб воно віддавало 200 без редиректу.
 *
 * `3d_url` приходить з CRM у вигляді `/3d?&favourites=&type=flyby...`, і кожна
 * з трьох дрібниць у цьому рядку окремо дає 301: слеш на початку (склеювався з
 * базою в `//3d`), відсутній слеш перед `?` (`/3d?` → `/3d/?`) і порожній
 * перший параметр (`?&` → `?`). Плюс в одного об'єкта значення приходить
 * загорнутим у лапки, тому їх теж зрізаємо.
 *
 * @param {number|string} url3d - `3d_url` з CRM або числовий id квартири
 * @returns {string}
 */

function buildFlatUrl(url3d) {
  if (parseInt(url3d)) {
    return `${ORIGIN}/3d/?currency=UAH&type=flat&id=${url3d}`;
  }

  const raw = String(url3d).trim().replace(/^['"]+/, '').replace(/['"]+$/, '');
  const [rawPath, rawQuery = ''] = raw.split('?');
  const path = rawPath.replace(/^\/+/, '').replace(/\/+$/, '');
  const query = rawQuery.replace(/^&+/, '');

  return `${ORIGIN}/${path}/${query ? `?${query}` : ''}`;
}

/**
 *
 * @param {FlatCardProps} props
 * @returns {string}
 */

export function FlatCard({ area, price, priceM2, img, number, build, section, floor, rooms, url3d }) {
  const url = buildFlatUrl(url3d);
  return `
    <a class="flat-card" href="${url}">
      <div class="flat-card__header">
        <div class="flat-card__area">
          <span class="flat-card__area-label">Площа:</span>
          <span class="flat-card__area-value">${area} м²</span>
        </div>
        <div class="flat-card__status">
          <span class="flat-card__status-label">Вільно</span>
          <svg width="17" height="16" viewBox="0 0 17 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path fill-rule="evenodd" clip-rule="evenodd" d="M8.2 15a7 7 0 1 0 0-14 7 7 0 0 0 0 14zm1.184-3.227l.11-.48a1.81 1.81 0 0 1-.276.099 1.233 1.233 0 0 1-.342.056c-.215 0-.366-.037-.453-.112-.087-.075-.13-.215-.13-.421 0-.082.013-.203.04-.363.026-.16.056-.302.09-.427l.412-1.552c.04-.142.068-.298.083-.47.015-.17.023-.289.023-.356 0-.328-.108-.593-.324-.798-.217-.204-.524-.306-.923-.306-.221 0-.456.041-.704.125-.248.083-.508.184-.78.301l-.11.48c.08-.032.177-.066.289-.101.112-.036.222-.053.33-.053.217 0 .365.039.442.117.077.078.115.217.115.416 0 .11-.012.232-.037.365a7.899 7.899 0 0 1-.093.424l-.413 1.558c-.037.163-.063.31-.08.44s-.025.257-.025.38c0 .32.111.585.334.793.223.208.536.312.938.312.262 0 .491-.036.689-.11.198-.072.463-.178.795-.317zM9.31 5.472c.192-.19.289-.42.289-.69a.943.943 0 0 0-.29-.694.95.95 0 0 0-.696-.288.96.96 0 0 0-.699.288.94.94 0 0 0-.292.693c0 .27.098.5.292.691.195.19.427.285.699.285a.955.955 0 0 0 .697-.285z" fill="#FAFBFE"></path>
          </svg>
          <span class="flat-card__tooltip">Наявність у системі перевірено</span>
        </div>
      </div>
      <div class="flat-card__img">
        <img src="https://riverville.com.ua${img}" alt="Планування квартири">
      </div>
      <div class="flat-card__info-wrapper">
        ${RenderInfoRow('Номер', number)}
        ${RenderInfoRow('Будинок', build)}
        ${RenderInfoRow('Секція', section)}
        ${RenderInfoRow('Поверх', floor)}
        ${RenderInfoRow('К-ть кімнат', rooms)}
      </div>
      <div class="flat-card__price">${price} ₴</div>
      <div class="flat-card__m2-price">
        <span class="flat-card__m2-price-label">₴ за м²:</span>
        <span class="flat-card__m2-price-value">${priceM2}</span>
      </div>
      <div class="flat-card__more">Детальніше</div>
    </a>
  `;
}

/**
 *
 * @returns {number|string}
 */

function getCurrentPage() {
  const url = window.location.href;
  const urlParts = url.split('/');
  if (url.includes('localhost')) {
    return urlParts[urlParts.length - 1];
  } else {
    return urlParts[urlParts.length - 2];
  }
}

/**
 *
 * @param {HTMLElement} flatsPage
 * @returns {HTMLElement|null}
 */
function getActiveTab(flatsPage) {
  return flatsPage.querySelector('[data-tab].flats-nav__tab--active');
}

/**
 *
 * @param {HTMLElement} flatsPage
 * @param {HTMLElement} tab
 */
function setActiveTab(flatsPage, tab) {
  const tabs = flatsPage.querySelectorAll('[data-tab]');
  tabs.forEach(tab => {
    tab.classList.remove('flats-nav__tab--active');
  });

  if (tab) {
    tab.classList.add('flats-nav__tab--active');
    return;
  } else {
    tabs.forEach(tab => {
      console.log(tab.getAttribute('data-tab'), getCurrentPage());
      if (tab.getAttribute('data-tab') === getCurrentPage()) {
        tab.classList.add('flats-nav__tab--active');
      }
    });
  }
}

/**
 * @param {Array} array
 */
function shuffleArray(array) {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
}

export async function getFlatsData() {
  if (window.location.href.includes('localhost')) {
    try {
      const response = await fetch('/static/mockFlatsData.json');
      if (!response.ok) {
        throw new Error('Файл з мок-даними не знайдено');
      }
      
      const data = await response.json();
      return data; 
    } catch (e) {
      console.error('Помилка при завантаженні мок-даних через fetch:', e);
      return [];
    }
  }

  const url = 'https://riverville.com.ua/wp-admin/admin-ajax.php';
  const params = new URLSearchParams({
    action: 'getFlats',
    currency: 'UAH',
  });

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (e) {
    console.error('Помилка при завантаженні квартир:', e);
    return [];
  }
}

/**
 *
 * @param {HTMLElement} flatsPage
 * @param {RealEstateUnit[]} flatsData
 */

function renderFlatList(flatsPage, flatsData) {
  const flatListContainer = flatsPage.querySelector('[data-flats-list]');
  const activeTabValue = getActiveTab(flatsPage).getAttribute('data-tab');

  const filteredFlats = flatsData.filter(flat => {
    if (flat.sale === '1') {
      if (activeTabValue === 'apartments') {
        return true;
      } else if (activeTabValue[0] === flat.rooms && flat.type !== 'Комерція') {
        return true;
      } else if (activeTabValue === 'commercial' && flat.type === 'Комерція') {
        return true;
      }
    }
    return false;
  });

  updateItemListSchema(filteredFlats); 

  let currentIndex = 0;
  const itemsPerBatch = 16;
  let isLoading = false;

  function loadMoreFlats() {
    if (isLoading || currentIndex >= filteredFlats.length) return;

    isLoading = true;

    const nextBatch = filteredFlats.slice(currentIndex, currentIndex + itemsPerBatch);

    const htmlContent = nextBatch
      .map(flat =>
        FlatCard({
          area: flat.area,
          price: flat.price,
          priceM2: flat.price_m2,
          img: flat.img_small,
          number: flat.number,
          build: flat.build,
          section: flat.section,
          floor: flat.floor,
          rooms: flat.rooms,
          url3d: (flat && flat['3d_url']) ? flat['3d_url'] : flat.id,
        }),
      )
      .join('');

    flatListContainer.insertAdjacentHTML('beforeend', htmlContent);

    currentIndex += itemsPerBatch;
    isLoading = false;
  }

  if (filteredFlats.length > 0) {
    flatListContainer.innerHTML = '';
    loadMoreFlats();
  } else {
    const listBody = flatsPage.querySelector('[data-flats-body]');
    listBody.innerHTML =
      '<p class="flats__list-empty inner-page-head__title">Квартир не знайдено :(</p>';
  }

  const observer = new IntersectionObserver(entries => {
    if (entries[0].isIntersecting) {
      loadMoreFlats();

      if (currentIndex >= filteredFlats.length) {
        observer.disconnect();
      }
    }
  });

  observer.observe(document.querySelector('[data-load-more-flats]'));
}

/**
 * @param {HTMLElement} flatsPage
 */

function tabsInit(flatsPage) {
  /**
   * @param {HTMLElement} flatsPage
   * @param {HTMLElement} tab
   */

  const moveBg = (flatsPage, tab) => {
    const tabBg = flatsPage.querySelector('[data-tab-bg]');
    const width = tab.offsetWidth + 1;
    const height = tab.offsetHeight;
    const top = tab.offsetTop;
    const left = tab.offsetLeft;

    tabBg.style.width = `${width}px`;
    tabBg.style.height = `${height}px`;
    tabBg.style.transform = `translateX(${left}px) translateY(${top}px)`;
  };

  const tabBg = flatsPage.querySelector('[data-tab-bg]');
  setActiveTab(flatsPage);
  moveBg(flatsPage, getActiveTab(flatsPage));
  tabBg.offsetHeight;
  tabBg.style.transition = 'transform 0.3s ease, width 0.3s ease';
  const tabs = flatsPage.querySelectorAll('[data-tab]');

  let isClicked = false;

  tabs.forEach(tab => {
    tab.addEventListener('click', e => {
      isClicked = true;
      setActiveTab(flatsPage, e.currentTarget);
      moveBg(flatsPage, getActiveTab(flatsPage));
    });

    tab.addEventListener('mouseenter', e => {
      setActiveTab(flatsPage, e.currentTarget);
      moveBg(flatsPage, getActiveTab(flatsPage));
    });

    tab.addEventListener('mouseleave', () => {
      if (!isClicked) {
        setActiveTab(flatsPage);
        moveBg(flatsPage, getActiveTab(flatsPage));
      }
    });
  });

  window.addEventListener('resize', () => moveBg(flatsPage, getActiveTab(flatsPage)));
}

/**
 * @param {HTMLElement} flatsPage
 * @param {RealEstateUnit[]} flatsData
 */
async function recommendationFlatsListInit(flatsPage, flatsData) {
  const recommendationListContainer = flatsPage.querySelector('[data-flats-recommendation-list]');
  if (!recommendationListContainer) return;

  const activeTabElement = getActiveTab(flatsPage);
  const activeTabValue = activeTabElement
    ? activeTabElement.getAttribute('data-tab')
    : 'apartments';

  const availableFlats = flatsData.filter(flat => {
    const isAvailable = flat.sale === '1';
    const isCommercialTab = activeTabValue === 'commercial';
    const isCommercialFlat = flat.type === 'Комерція';

    if (!isAvailable) return false;

    return isCommercialTab ? isCommercialFlat : !isCommercialFlat;
  });

  const randomRecommendations = shuffleArray(availableFlats).slice(0, 8);
  recommendationListContainer.innerHTML = randomRecommendations
    .map(
      flat => `
      <div class="swiper-slide">
        ${FlatCard({
          area: flat.area,
          price: flat.price,
          priceM2: flat.price_m2,
          img: flat.img_small,
          number: flat.number,
          build: flat.build,
          section: flat.section,
          floor: flat.floor,
          rooms: flat.rooms,
          url3d: (flat && flat['3d_url']) ? flat['3d_url'] : flat.id,
        })}
      </div>
    `,
    )
    .join('');

  if (recommendationListContainer.swiper) {
    recommendationListContainer.swiper.destroy(true, true);
  }

  const { default: Swiper, Navigation } = await import(/* webpackChunkName: "swiper" */ 'swiper');

  new Swiper('[data-swiper-container]', {
    modules: [Navigation],
    slidesPerView: 1,
    spaceBetween: 16,
    observer: true,
    observeParents: true,
    slidesOffsetBefore: 20,
    slidesOffsetAfter: 20,
    autoHeight: false,
    navigation: {
      nextEl: '[data-next-slide]',
      prevEl: '[data-prev-slide]',
    },
    breakpoints: {
      660: {
        slidesPerView: 2,
      },
      968: {
        slidesPerView: 3,
      },
      1024: {
        slidesOffsetBefore: 40,
        slidesOffsetAfter: 40,
      },
      1334: {
        slidesPerView: 4,
      },
      1920: {
        slidesPerView: 5,
      },
    },
  });
}

async function flatsInit() {
  const flatsPage = document.querySelector('[data-flats-page]');
  const result = await getFlatsData();
  tabsInit(flatsPage);
  renderFlatList(flatsPage, result);
  recommendationFlatsListInit(flatsPage, result);
}

addEventListener('DOMContentLoaded', flatsInit);
