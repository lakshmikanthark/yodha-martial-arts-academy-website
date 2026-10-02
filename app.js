(() => {
  'use strict';
  const root = document.documentElement;
  const body = document.body;
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = matchMedia('(hover: hover) and (pointer: fine)').matches;
  root.classList.add('v13-runtime');
  body.classList.toggle('motion-reduced', reduceMotion);

  const header = document.querySelector('[data-header]');
  const menuButton = document.querySelector('[data-menu]');
  const nav = document.querySelector('[data-nav]');
  let menuReturnFocus = null;
  const setMenu = (open) => {
    if (!menuButton || !nav) return;
    if (open) menuReturnFocus = document.activeElement;
    menuButton.setAttribute('aria-expanded', String(open));
    menuButton.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
    nav.classList.toggle('open', open);
    body.classList.toggle('nav-open', open);
    if (!open && menuReturnFocus instanceof HTMLElement) menuReturnFocus.focus({preventScroll:true});
  };
  menuButton?.addEventListener('click', () => setMenu(menuButton.getAttribute('aria-expanded') !== 'true'));
  nav?.querySelectorAll('a').forEach(a => a.addEventListener('click', () => setMenu(false)));
  addEventListener('keydown', e => { if (e.key === 'Escape') setMenu(false); });

  const normalized = p => p.replace(/\/+$/, '') || '/';
  const current = normalized(location.pathname);
  document.querySelectorAll('.primary-nav a').forEach(link => {
    try { if (normalized(new URL(link.href, location.href).pathname) === current) link.setAttribute('aria-current','page'); } catch {}
  });

  const progress = document.querySelector('[data-page-progress]');
  let scrollQueued = false;
  const updateScroll = () => {
    scrollQueued = false;
    const y = scrollY || 0;
    header?.classList.toggle('is-compact', y > 26);
    if (progress) {
      const max = Math.max(1, document.documentElement.scrollHeight - innerHeight);
      progress.style.transform = `scaleX(${Math.min(1, y / max)})`;
    }
    if (!reduceMotion) {
      const hero = document.querySelector('.v13-hero-media img');
      if (hero && y < innerHeight * 1.2) hero.style.transform = `scale(${1.045 + Math.min(.055, y / innerHeight * .045)}) translateY(${Math.min(4, y / innerHeight * 3)}%)`;
      const strength = document.querySelector('.v13-strength-media img');
      if (strength) {
        const r = strength.parentElement.getBoundingClientRect();
        if (r.top < innerHeight && r.bottom > 0) {
          const p = (innerHeight - r.top) / (innerHeight + r.height);
          strength.style.transform = `scale(1.04) translateY(${(p-.5)*4}%)`;
        }
      }
    }
  };
  addEventListener('scroll', () => { if (!scrollQueued) { scrollQueued = true; requestAnimationFrame(updateScroll); } }, {passive:true});
  updateScroll();

  const revealTargets = [...document.querySelectorAll('.reveal,.reveal-clip,[data-reveal]')];
  if (reduceMotion || !('IntersectionObserver' in window)) revealTargets.forEach(n => n.classList.add('is-visible'));
  else {
    const revealObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => { if (entry.isIntersecting) { entry.target.classList.add('is-visible'); revealObserver.unobserve(entry.target); } });
    }, {threshold:.08, rootMargin:'0px 0px -7% 0px'});
    revealTargets.forEach(n => revealObserver.observe(n));
  }

  // Method chapter state. Information remains fully present even if JS or motion is disabled.
  const methodSteps = [...document.querySelectorAll('[data-method-step]')];
  const methodMedia = [...document.querySelectorAll('[data-method-media]')];
  const methodProgress = document.querySelector('[data-method-progress]');
  const setMethod = idx => {
    methodSteps.forEach((n,i) => n.classList.toggle('is-active', i === idx));
    methodMedia.forEach((n,i) => n.classList.toggle('is-active', i === idx));
    if (methodProgress) methodProgress.style.width = `${((idx + 1) / Math.max(1, methodSteps.length)) * 100}%`;
  };
  if (methodSteps.length && 'IntersectionObserver' in window) {
    const methodObserver = new IntersectionObserver(entries => {
      const visible = entries.filter(e => e.isIntersecting).sort((a,b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (visible) setMethod(Number(visible.target.dataset.methodStep || 0));
    }, {threshold:[.2,.45,.65], rootMargin:'-22% 0px -34% 0px'});
    methodSteps.forEach(n => methodObserver.observe(n));
  }

  // Small magnetic feedback: only explicit controls, desktop pointer, never keyboard-dependent.
  if (finePointer && !reduceMotion) {
    document.querySelectorAll('[data-magnetic]').forEach(node => {
      const reset = () => { node.style.transform=''; };
      node.addEventListener('pointermove', e => {
        const r=node.getBoundingClientRect();
        const x=(e.clientX-r.left)/r.width-.5, y=(e.clientY-r.top)/r.height-.5;
        node.style.transform=`translate3d(${x*8}px,${y*6}px,0)`;
      });
      node.addEventListener('pointerleave', reset);
      node.addEventListener('blur', reset);
    });
  }

  document.querySelectorAll('img[data-fallback]').forEach(img => img.addEventListener('error', () => {
    const fb=img.dataset.fallback; if (fb && !img.dataset.fallbackUsed) { img.dataset.fallbackUsed='true'; img.src=fb; }
  }, {once:true}));

  // Persistent contact shortcut: hover/focus on desktop, tap toggle on touch devices.
  if (!document.querySelector('[data-floating-contact]')) {
    const floating = document.createElement('div');
    floating.className = 'floating-contact';
    floating.setAttribute('data-floating-contact','');
    floating.innerHTML = `
      <div class="floating-contact__actions" id="floating-contact-actions" aria-label="Contact Yodha">
        <a class="floating-contact__action" href="https://wa.me/919986480301?text=Hi%20Yodha%2C%20I%27d%20like%20to%20ask%20about%20training." target="_blank" rel="noopener" aria-label="Message Yodha on WhatsApp">
          <svg aria-hidden="true" viewBox="0 0 24 24"><path d="M20 11.5a8 8 0 0 1-11.9 7L4 20l1.5-4A8 8 0 1 1 20 11.5Z"/><path d="M9 8.8c.4 2.2 2.2 4 4.4 4.5"/><path d="M8.8 8.3 10 8l.8 1.8-.8.8M13.4 13.2l.8-.8 1.8.8-.3 1.2"/></svg>
          <span>WhatsApp</span>
        </a>
        <a class="floating-contact__action" href="tel:+919986480301" aria-label="Call Yodha Martial Arts Academy">
          <svg aria-hidden="true" viewBox="0 0 24 24"><path d="M7.2 3.5 9.5 8 7.7 9.8a14.8 14.8 0 0 0 6.5 6.5l1.8-1.8 4.5 2.3-.7 3.2c-.2.8-.9 1.4-1.7 1.4A16.5 16.5 0 0 1 2.6 5.9c0-.8.6-1.5 1.4-1.7l3.2-.7Z"/></svg>
          <span>Call</span>
        </a>
      </div>
      <button class="floating-contact__trigger" type="button" aria-expanded="false" aria-controls="floating-contact-actions" aria-label="Contact Yodha">
        <svg aria-hidden="true" viewBox="0 0 24 24"><path d="M7.2 3.5 9.5 8 7.7 9.8a14.8 14.8 0 0 0 6.5 6.5l1.8-1.8 4.5 2.3-.7 3.2c-.2.8-.9 1.4-1.7 1.4A16.5 16.5 0 0 1 2.6 5.9c0-.8.6-1.5 1.4-1.7l3.2-.7Z"/></svg>
      </button>`;
    body.appendChild(floating);
    const trigger = floating.querySelector('.floating-contact__trigger');
    const setFloating = open => {
      floating.classList.toggle('is-open', open);
      trigger?.setAttribute('aria-expanded', String(open));
    };
    trigger?.addEventListener('click', () => setFloating(!floating.classList.contains('is-open')));
    floating.addEventListener('focusout', e => { if (!floating.contains(e.relatedTarget)) setFloating(false); });
    document.addEventListener('pointerdown', e => { if (!floating.contains(e.target) && floating.classList.contains('is-open')) setFloating(false); });
    document.addEventListener('keydown', e => { if (e.key === 'Escape' && floating.classList.contains('is-open')) { setFloating(false); trigger?.focus(); } });
    const updateFloatingVisibility = () => {
      const mobile = innerWidth <= 820;
      floating.classList.toggle('is-mobile-visible', !mobile || scrollY > Math.min(innerHeight * .58, 460));
      if (mobile && scrollY <= Math.min(innerHeight * .58, 460)) setFloating(false);
    };
    addEventListener('scroll', updateFloatingVisibility, {passive:true});
    addEventListener('resize', updateFloatingVisibility);
    updateFloatingVisibility();
  }

  document.querySelectorAll('a[target="_blank"]').forEach(link => {
    const rel=new Set((link.getAttribute('rel')||'').split(/\s+/).filter(Boolean)); rel.add('noopener'); link.setAttribute('rel',[...rel].join(' '));
  });
})();
