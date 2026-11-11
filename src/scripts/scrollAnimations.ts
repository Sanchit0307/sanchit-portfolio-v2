import { inView, animate } from 'motion';

export function initScrollAnimations() {
  if (typeof window === 'undefined') return;

  // Respect user preference for reduced motion
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReduced) {
    document.querySelectorAll<HTMLElement>('[data-animate], [data-animate-item], [data-hero-animate]').forEach((el) => {
      el.style.opacity = '1';
      el.style.transform = 'none';
    });
    return;
  }

  document.documentElement.classList.add('motion-ready');

  // 1. Hero Staggered Entrance (immediate upon mount)
  const heroElements = document.querySelectorAll<HTMLElement>('[data-hero-animate]');
  if (heroElements.length > 0) {
    heroElements.forEach((el, index) => {
      animate(
        el,
        { opacity: [0, 1], y: [14, 0] },
        {
          duration: 0.55,
          delay: index * 0.08,
          easing: [0.16, 1, 0.3, 1],
        }
      ).finished.then(() => {
        el.classList.add('is-revealed');
        el.style.opacity = '';
        el.style.transform = '';
      });
    });
  }

  // 2. Portrait refined reveal
  const portrait = document.querySelector<HTMLElement>('[data-hero-portrait]');
  if (portrait && !portrait.classList.contains('is-revealed')) {
    animate(
      portrait,
      { opacity: [0, 1], scale: [0.97, 1] },
      {
        duration: 0.7,
        delay: 0.15,
        easing: [0.16, 1, 0.3, 1],
      }
    ).finished.then(() => {
      portrait.classList.add('is-revealed');
      portrait.style.opacity = '';
      portrait.style.transform = '';
    });
  }

  // 3. Scroll-triggered fade-up sections
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
          el.style.opacity = '';
          el.style.transform = '';
        });
      },
      { margin: '0px 0px -40px 0px' }
    );
  });

  // 4. Staggered containers & card groups
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
              item.style.opacity = '';
              item.style.transform = '';
            });
          });
        }
        container.classList.add('is-revealed');
      },
      { margin: '0px 0px -40px 0px' }
    );
  });

  // 5. Timeline Track Progress Animation
  const timelineTracks = document.querySelectorAll<HTMLElement>('[data-timeline-track]');
  timelineTracks.forEach((track) => {
    inView(
      track,
      () => {
        animate(
          track,
          { scaleY: [0, 1] },
          { duration: 0.75, easing: [0.22, 1, 0.36, 1] }
        );
      },
      { margin: '0px 0px -60px 0px' }
    );
  });
}
