import { inView, animate } from 'motion';

export function initScrollAnimations() {
  if (typeof window === 'undefined') return;

  // Respect user preference for reduced motion
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReduced) {
    document.querySelectorAll<HTMLElement>('[data-animate], [data-animate-item], [data-hero-animate], [data-hero-portrait]').forEach((el) => {
      el.style.opacity = '1';
      el.style.transform = 'none';
      el.classList.add('is-revealed');
    });
    return;
  }

  document.documentElement.classList.add('motion-ready');

  // Helper: check if element is already within the visible viewport on mount/page-enter
  const isElementInViewport = (el: HTMLElement) => {
    const rect = el.getBoundingClientRect();
    return rect.top < window.innerHeight * 0.92 && rect.bottom > 0;
  };

  // 1. Hero Staggered Entrance (on homepage)
  const heroElements = document.querySelectorAll<HTMLElement>('[data-hero-animate]');
  if (heroElements.length > 0) {
    heroElements.forEach((el, index) => {
      if (el.classList.contains('is-revealed')) {
        el.style.opacity = '';
        el.style.transform = '';
        return;
      }
      animate(
        el,
        { opacity: [0, 1], y: [18, 0] },
        {
          duration: 0.55,
          delay: 0.06 + index * 0.08,
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
      { opacity: [0, 1], scale: [0.98, 1], y: [14, 0] },
      {
        duration: 0.65,
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
    if (isElementInViewport(el)) {
      animate(
        el,
        { opacity: [0, 1], y: [16, 0] },
        { duration: 0.5, easing: [0.16, 1, 0.3, 1] }
      ).finished.then(() => {
        el.classList.add('is-revealed');
        el.style.opacity = '';
        el.style.transform = '';
      });
      return;
    }

    inView(
      el,
      () => {
        animate(
          el,
          { opacity: [0, 1], y: [22, 0] },
          { duration: 0.6, easing: [0.16, 1, 0.3, 1] }
        ).finished.then(() => {
          el.classList.add('is-revealed');
          el.style.opacity = '';
          el.style.transform = '';
        });
      },
      { margin: '0px 0px -40px 0px' }
    );
  });

  // 4. Staggered containers & card groups (Project cards, skills, timeline entries, stats)
  const staggerContainers = document.querySelectorAll<HTMLElement>('[data-animate="stagger"]:not(.is-revealed)');
  staggerContainers.forEach((container) => {
    const isAboveFold = isElementInViewport(container);
    const triggerMargin = isAboveFold ? '0px' : '0px 0px -60px 0px';

    inView(
      container,
      () => {
        const items = container.querySelectorAll<HTMLElement>('[data-animate-item]:not(.is-revealed)');
        if (items.length > 0) {
          items.forEach((item, index) => {
            const delay = Math.min(index * 0.08, 0.4);
            animate(
              item,
              { opacity: [0, 1], y: [20, 0], scale: [0.985, 1] },
              { duration: 0.55, delay, easing: [0.16, 1, 0.3, 1] }
            ).finished.then(() => {
              item.classList.add('is-revealed');
              item.style.opacity = '';
              item.style.transform = '';
            });
          });
        }
        container.classList.add('is-revealed');
      },
      { margin: triggerMargin }
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
          { duration: 0.75, easing: [0.16, 1, 0.3, 1] }
        );
      },
      { margin: '0px 0px -40px 0px' }
    );
  });

  // 6. Smooth anchor scrolling for in-page hashes only (avoids cross-page scroll jumps)
  document.querySelectorAll<HTMLAnchorElement>('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', (e) => {
      const hash = anchor.getAttribute('href');
      if (!hash || hash === '#') return;
      const target = document.querySelector(hash);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        history.pushState(null, '', hash);
      }
    });
  });
}
