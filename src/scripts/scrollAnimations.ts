import { inView, animate } from 'motion';

export function initScrollAnimations() {
  if (typeof window === 'undefined') return;

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReduced) {
    document.querySelectorAll<HTMLElement>('[data-animate], [data-animate-item]').forEach((el) => {
      el.style.opacity = '1';
      el.style.transform = 'none';
    });
    return;
  }

  document.documentElement.classList.add('motion-ready');

  // Single fade-up elements
  const fadeUpElements = document.querySelectorAll<HTMLElement>('[data-animate="fade-up"]:not(.is-revealed)');
  fadeUpElements.forEach((el) => {
    inView(
      el,
      () => {
        animate(
          el,
          { opacity: [0, 1], y: [16, 0] },
          { duration: 0.5, easing: [0.22, 1, 0.36, 1] }
        ).finished.then(() => {
          el.classList.add('is-revealed');
          el.style.transform = '';
          el.style.opacity = '';
        });
      },
      { margin: '0px 0px -40px 0px' }
    );
  });

  // Stagger containers
  const staggerContainers = document.querySelectorAll<HTMLElement>('[data-animate="stagger"]:not(.is-revealed)');
  staggerContainers.forEach((container) => {
    inView(
      container,
      () => {
        const items = container.querySelectorAll<HTMLElement>('[data-animate-item]:not(.is-revealed)');
        if (items.length > 0) {
          items.forEach((item, index) => {
            const delay = Math.min(index * 0.05, 0.25);
            animate(
              item,
              { opacity: [0, 1], y: [16, 0] },
              { duration: 0.45, delay, easing: [0.22, 1, 0.36, 1] }
            ).finished.then(() => {
              item.classList.add('is-revealed');
              item.style.transform = '';
              item.style.opacity = '';
            });
          });
        }
        container.classList.add('is-revealed');
      },
      { margin: '0px 0px -40px 0px' }
    );
  });
}
