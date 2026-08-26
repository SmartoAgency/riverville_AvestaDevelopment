// Приймає CSS-селектор (як і раніше — так його викликають about/commercial/
// developer/restaurant) або конкретний елемент чи колекцію. Поелементний виклик
// потрібен головній: там ефект вішається не одним проходом по всій сторінці,
// а на кожен заголовок окремо, коли той доходить до вьюпорта.
function toElements(target) {
  if (typeof target === 'string') return Array.from(document.querySelectorAll(target));
  if (target instanceof Element) return [target];
  if (target && typeof target.length === 'number') return Array.from(target);
  return [];
}

// immediate: програти анімацію одразу, без ScrollTrigger. Момент запуску в
// цьому режимі визначає той, хто викликає (на головній — IntersectionObserver),
// тому тягнути заради цього чанк gsap-scroll не потрібно: ScrollTrigger тут
// робив рівно те саме, що й IO з threshold 0 — стартував, коли верх елемента
// перетинав нижню межу вьюпорта, і більше не повторювався (once: true).
export default function splitToLinesAndFadeUp(target, gsap, { immediate = false } = {}) {
    toElements(target).forEach(text => {
        let mathM = text.innerHTML.match(/<\s*(\w+\b)(?:(?!<\s*\/\s*\1\b)[\s\S])*<\s*\/\s*\1\s*>|\S+/g);
        if (mathM === null) return;
        mathM = mathM.map(el => `<span style="display:inline-flex"><span>${el}</span></span>`);
        text.innerHTML = mathM.join(' ');
        gsap.set(text.children, { overflow: 'hidden' });
        gsap.set(text.querySelectorAll('span>span'), { overflow: 'initial', display: 'inline-block' });
        gsap
          .timeline(
            immediate
              ? {}
              : {
                  scrollTrigger: {
                    trigger: text,
                    once: true,
                  },
                },
          )
          .fromTo(
            text.querySelectorAll('span>span'),
            { yPercent: 100,  },
            { yPercent: 0,  stagger: 0.05, duration: 1, ease: 'power4.out' },
          )
          .add(() => {
            text.innerHTML = text.textContent;
          });
      });
}
