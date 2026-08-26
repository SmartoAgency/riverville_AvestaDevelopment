import './modules/public-path';
import { gsap } from 'gsap';
import { lenis } from './modules/scroll/leniscroll';
import splitToLinesAndFadeUp from './modules/effects/splitLinesAndFadeUp';
import { FlatCard, getFlatsData } from './apartments';
import gallerySlider from './modules/gallery/gallerySlider';

async function initFlatList() {
  const flatsList = document.querySelector('[data-flats-list]');
  if (!flatsList) return;

  const flats = await getFlatsData();
  const commercialFlats = flats.filter(flat => {
    if (flat.type === 'Комерція' && flat.sale === '1') return true;
  });

  const htmlContent = commercialFlats
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
        url3d: flat && flat['3d_url'] ? flat['3d_url'] : flat.id,
      }),
    )
    .join('');

  flatsList.innerHTML = htmlContent;
}

// Не залежить від gsap/Swiper — не чекає на них, щоб не затримувати рендер списку.
initFlatList();

Promise.all([
  import(/* webpackChunkName: "gsap-scroll" */ 'gsap/ScrollTrigger'),
  import(/* webpackChunkName: "swiper" */ 'swiper'),
]).then(([{ ScrollTrigger }, { default: Swiper, Navigation }]) => {
  Swiper.use([Navigation]);

  gsap.registerPlugin(ScrollTrigger);
  gsap.core.globals('ScrollTrigger', ScrollTrigger);

  splitToLinesAndFadeUp('[data-split-lines-and-fade-up]', gsap);

  gallerySlider(gsap, Swiper);
});
