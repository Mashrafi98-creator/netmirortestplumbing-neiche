/* Verdant & Stone — interactions */
(() => {
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const hasGsap = typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined';
  $('#yr').textContent = new Date().getFullYear();

  /* ---------- Smooth scroll ---------- */
  let lenis = null;
  if (!reduce && typeof Lenis !== 'undefined') {
    lenis = new Lenis({ duration: 1.15, easing: t => 1 - Math.pow(1 - t, 4) });
    if (hasGsap) {
      lenis.on('scroll', ScrollTrigger.update);
      gsap.ticker.add(t => lenis.raf(t * 1000));
      gsap.ticker.lagSmoothing(0);
    } else {
      const raf = t => { lenis.raf(t); requestAnimationFrame(raf); };
      requestAnimationFrame(raf);
    }
  }
  const scrollTo = target => lenis ? lenis.scrollTo(target, { offset: -20 }) : target.scrollIntoView({ behavior: 'smooth' });
  $$('a[href^="#"]').forEach(a => a.addEventListener('click', e => {
    const id = a.getAttribute('href');
    const el = id.length > 1 ? $(id) : $('#top');
    if (!el) return;
    e.preventDefault();
    closeMenu();
    if (a.dataset.type) preselect(a.dataset.type);
    scrollTo(el);
  }));

  /* ---------- Nav ---------- */
  const nav = $('#nav'), burger = $('.nav__burger'), menu = $('#mobileMenu'), mcta = $('.mcta');
  let lastY = 0;
  const onScroll = () => {
    const y = window.scrollY;
    nav.classList.toggle('is-scrolled', y > 40);
    nav.classList.toggle('is-hidden', y > 500 && y > lastY && !menu.classList.contains('is-open'));
    mcta.classList.toggle('is-visible', y > innerHeight * .8);
    lastY = y;
  };
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();
  function closeMenu() {
    menu.classList.remove('is-open'); burger.setAttribute('aria-expanded', 'false'); menu.setAttribute('aria-hidden', 'true');
    lenis && lenis.start();
  }
  burger.addEventListener('click', () => {
    const open = !menu.classList.contains('is-open');
    if (!open) return closeMenu();
    menu.classList.add('is-open'); burger.setAttribute('aria-expanded', 'true'); menu.setAttribute('aria-hidden', 'false');
    lenis && lenis.stop();
  });

  /* ---------- Before / after ---------- */
  const ba = $('#baSlider');
  if (ba) {
    const range = $('.ba__range', ba);
    range.addEventListener('input', () => ba.style.setProperty('--pos', range.value + '%'));
  }

  /* ---------- Reviews carousel ---------- */
  const quotes = $$('.quote'), dots = $$('.qdot');
  let qi = 0, qTimer;
  const showQuote = i => {
    qi = (i + quotes.length) % quotes.length;
    quotes.forEach((q, k) => q.classList.toggle('is-active', k === qi));
    dots.forEach((d, k) => d.classList.toggle('is-active', k === qi));
  };
  const autoQuote = () => { clearInterval(qTimer); qTimer = setInterval(() => showQuote(qi + 1), 6500); };
  dots.forEach((d, k) => d.addEventListener('click', () => { showQuote(k); autoQuote(); }));
  autoQuote();

  /* ---------- Multi-step quote form ---------- */
  const form = $('#qform'), steps = $$('.qstep', form), prog = $('#qprog'), err = $('#qerr');
  const back = $('#qback'), next = $('#qnext');
  let step = 1;
  const total = 4;
  const render = () => {
    steps.forEach(s => s.classList.toggle('is-active', +s.dataset.step === step));
    prog.style.width = (Math.min(step, total) / total * 100) + '%';
    back.style.visibility = step > 1 && step <= total ? 'visible' : 'hidden';
    next.textContent = step === total ? 'Request My Consultation →' : 'Continue →';
    err.textContent = '';
  };
  const validate = () => {
    const cur = steps.find(s => +s.dataset.step === step);
    const radios = $$('input[type=radio]', cur);
    if (radios.length && !radios.some(r => r.checked)) return 'Please choose an option to continue.';
    for (const inp of $$('input[required]', cur)) {
      if (!inp.value.trim()) return 'Please complete all required fields.';
      if (inp.type === 'email' && !/^\S+@\S+\.\S+$/.test(inp.value)) return 'Please enter a valid email address.';
    }
    return '';
  };
  next.addEventListener('click', () => {
    const msg = validate();
    if (msg) { err.textContent = msg; return; }
    if (step === total) {
      // Hook up to a CRM / form service here (e.g. fetch('/api/lead', { method: 'POST', body: new FormData(form) }))
      const data = Object.fromEntries(new FormData(form));
      console.info('Lead captured', data);
      form.classList.add('is-done');
      step = 5;
    } else step++;
    render();
  });
  back.addEventListener('click', () => { if (step > 1) { step--; render(); } });
  // Auto-advance on chip choice for a snappier feel
  $$('.chips input', form).forEach(r => r.addEventListener('change', () => setTimeout(() => { if (step < total) { step++; render(); } }, 260)));
  form.addEventListener('submit', e => e.preventDefault());
  function preselect(label) {
    const map = { 'Residential estate': 'Residential estate', 'Commercial property': 'Commercial property', 'Year-round care': 'Year-round care' };
    const r = $(`input[name=type][value="${map[label]}"]`, form);
    if (r && step === 1) { r.checked = true; step = 2; render(); }
  }
  render();

  /* ---------- Text helpers ---------- */
  const wrapWords = el => {
    const words = el.textContent.trim().split(/\s+/);
    el.innerHTML = words.map(w => `<span class="w">${w}</span>`).join(' ');
    return $$('.w', el);
  };
  // Split into lines, preserving <em>, for masked line reveals
  const splitLines = el => {
    const original = el.innerHTML;
    const tokens = [];
    el.childNodes.forEach(n => {
      const isEm = n.nodeType === 1;
      n.textContent.split(/(\s+)/).forEach(t => { if (t.trim()) tokens.push({ t, isEm }); });
    });
    el.innerHTML = tokens.map(({ t, isEm }) => `<span class="tok">${isEm ? `<em>${t}</em>` : t}</span>`).join(' ');
    const lines = [];
    let top = null;
    $$('.tok', el).forEach(s => {
      if (s.offsetTop !== top) { lines.push([]); top = s.offsetTop; }
      lines[lines.length - 1].push(s.innerHTML);
    });
    el.innerHTML = lines.map(l => `<span class="line"><span>${l.join(' ')}</span></span>`).join('');
    return { inner: $$('.line > span', el), restore: () => { el.innerHTML = original; } };
  };

  const hideLoader = () => { const l = $('.loader'); if (l) l.remove(); document.body.classList.remove('is-loading'); };

  if (!hasGsap || reduce) {
    hideLoader();
    $$('[data-count]').forEach(n => n.textContent = (+n.dataset.count).toLocaleString() + (n.dataset.suffix || ''));
    return;
  }

  /* ---------- GSAP motion ---------- */
  gsap.registerPlugin(ScrollTrigger);
  document.body.classList.add('is-loading');

  const start = () => {
    // Loader → hero intro
    const heroTitle = $('.hero__title');
    const heroSplit = splitLines(heroTitle);
    const tl = gsap.timeline({ defaults: { ease: 'expo.out' } });
    tl.from('.loader__mark > *', { yPercent: 110, duration: .9, stagger: .08 })
      .to('.loader__mark > *', { yPercent: -110, duration: .6, stagger: .05, ease: 'expo.in' }, '+=.25')
      .to('.loader', { clipPath: 'inset(0 0 100% 0)', duration: 1, ease: 'expo.inOut', onComplete: hideLoader }, '-=.15')
      .from('.hero__media img', { scale: 1.3, duration: 2.2 }, '<')
      .from(heroSplit.inner, { yPercent: 110, duration: 1.3, stagger: .1, onComplete: heroSplit.restore }, '-=1.4')
      .from('.hero .reveal-up', { y: 30, autoAlpha: 0, duration: 1.1, stagger: .1 }, '-=1')
      .from('.nav', { y: -30, autoAlpha: 0, duration: 1 }, '<');

    // Section headings: masked line reveals
    $$('.split').forEach(el => {
      if (el === heroTitle) return;
      const s = splitLines(el);
      gsap.from(s.inner, {
        yPercent: 110, duration: 1.2, ease: 'expo.out', stagger: .09,
        scrollTrigger: { trigger: el, start: 'top 88%' }, onComplete: s.restore
      });
    });

    // Generic fade-ups
    gsap.utils.toArray('.pcard, .svc__item, .step, .ba__copy > p, .ticks li, .contact-lines > *, .qform, .final__note').forEach(el => {
      gsap.from(el, { y: 50, autoAlpha: 0, duration: 1.2, ease: 'expo.out', scrollTrigger: { trigger: el, start: 'top 92%' } });
    });

    // Image reveal with clip + scale
    gsap.utils.toArray('.pcard__media, .ba__slider').forEach(el => {
      gsap.fromTo(el, { clipPath: 'inset(12% 8% 12% 8% round 18px)' }, {
        clipPath: 'inset(0% 0% 0% 0% round 0px)', ease: 'none',
        scrollTrigger: { trigger: el, start: 'top 95%', end: 'top 45%', scrub: true }
      });
    });

    // Parallax backgrounds
    $$('[data-speed]').forEach(el => {
      gsap.to(el, { yPercent: +el.dataset.speed * 40, ease: 'none', scrollTrigger: { trigger: el.parentElement, start: 'top top', end: 'bottom top', scrub: true } });
    });
    gsap.fromTo('.final__media', { yPercent: -8 }, { yPercent: 8, ease: 'none', scrollTrigger: { trigger: '.final', start: 'top bottom', end: 'bottom top', scrub: true } });

    // Counters
    $$('[data-count]').forEach(n => {
      const o = { v: 0 }, end = +n.dataset.count, suf = n.dataset.suffix || '';
      gsap.to(o, { v: end, duration: 2.2, ease: 'power3.out', scrollTrigger: { trigger: n, start: 'top 90%' },
        onUpdate: () => { n.textContent = Math.round(o.v).toLocaleString() + suf; } });
    });

    // Manifesto word highlight
    const words = wrapWords($('[data-highlight]'));
    gsap.to(words, { opacity: 1, stagger: .1, ease: 'none', scrollTrigger: { trigger: '.manifesto', start: 'top 75%', end: 'bottom 60%', scrub: true } });

    // Process line + step activation
    const stepsEl = $('.steps');
    ScrollTrigger.create({ trigger: stepsEl, start: 'top 75%', end: 'bottom 55%', scrub: true,
      onUpdate: self => {
        stepsEl.style.setProperty('--progress', self.progress.toFixed(3));
        $$('.step', stepsEl).forEach((s, i, a) => s.classList.toggle('is-on', self.progress >= i / a.length));
      } });

    // Horizontal pinned gallery (desktop) / vertical reveals (mobile)
    const mm = gsap.matchMedia();
    mm.add('(min-width: 821px)', () => {
      const track = $('.work__track');
      const dist = () => track.scrollWidth - (innerWidth - $('.work__intro').offsetWidth);
      const tween = gsap.to(track, { x: () => -dist(), ease: 'none',
        scrollTrigger: { trigger: '.work', pin: true, start: 'top top', end: () => '+=' + dist(), scrub: 1, invalidateOnRefresh: true } });
      $$('.wcard__media img').forEach(img => gsap.fromTo(img, { xPercent: -6 }, { xPercent: 6, ease: 'none',
        scrollTrigger: { trigger: img.parentElement, containerAnimation: tween, start: 'left right', end: 'right left', scrub: true } }));
    });
    mm.add('(max-width: 820px)', () => {
      $$('.wcard').forEach(c => gsap.from(c, { y: 60, autoAlpha: 0, duration: 1.1, ease: 'expo.out', scrollTrigger: { trigger: c, start: 'top 90%' } }));
    });

    // Magnetic primary buttons (pointer devices only)
    if (matchMedia('(hover: hover)').matches) {
      $$('.btn--brass, .btn--light').forEach(b => {
        b.addEventListener('mousemove', e => {
          const r = b.getBoundingClientRect();
          gsap.to(b, { x: (e.clientX - r.left - r.width / 2) * .25, y: (e.clientY - r.top - r.height / 2) * .35, duration: .5, ease: 'power3.out' });
        });
        b.addEventListener('mouseleave', () => gsap.to(b, { x: 0, y: 0, duration: .8, ease: 'elastic.out(1, .4)' }));
      });
    }

    ScrollTrigger.refresh();
  };

  // Wait for web fonts so line splits are measured correctly (with a safety timeout)
  let started = false;
  const go = () => { if (!started) { started = true; start(); } };
  (document.fonts ? document.fonts.ready : Promise.resolve()).then(go);
  setTimeout(go, 1500);
})();
