function initMallSlider() {
  const mallSlider = document.querySelector("[data-mall-slider]");
  if (!mallSlider) return;

  const prevButton = mallSlider.querySelector("[data-mall-slider-prev]");
  const nextButton = mallSlider.querySelector("[data-mall-slider-next]");
  if (!prevButton || !nextButton) return;

  new Swiper(mallSlider, {
    slidesPerView: 1,
    loop: true,
    speed: 600,
    autoplay: {
      delay: 4000,
      disableOnInteraction: false,
    },
    navigation: {
      prevEl: prevButton,
      nextEl: nextButton,
    },
  });
}

initMallSlider();