/**
 * Minimal, professional motion for marketing pages:
 * hero entrance, scroll reveals, stat count-up, card hover lift,
 * soft floating stickers, highlighter draw-in, opt-in marquee
 * and a thin scroll-progress bar.
 * Include last on the page: <script src="assets/js/animations.js" data-accent="#hex"></script>
 * Optional: data-draw="<selector>" (default ".hl") for gradient highlighters that draw in,
 * [data-marquee] on a strip to make it scroll slowly, [data-no-reveal] / [data-no-count] to opt out.
 * Everything is disabled for visitors who prefer reduced motion.
 */
(function () {
  const script = document.currentScript;
  const accent = (script && script.dataset.accent) || '#10b981';
  const drawSelector = (script && script.dataset.draw) || '.hl';
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const EASE = 'cubic-bezier(.22,1,.36,1)';

  // `translate` (not `transform`) so existing Tailwind rotate/translate classes keep working.
  // .rv comes after .lift so a revealing card keeps its fade + stagger delay.
  const style = document.createElement('style');
  style.textContent = `
    .lift { transition: translate .35s ${EASE}, box-shadow .35s ${EASE}; }
    .lift:hover { translate: 0 -4px; box-shadow: 0 22px 45px -24px rgba(15, 23, 42, .45); }
    .rv { opacity: 0; translate: 0 26px; transition: opacity .8s ${EASE}, translate .8s ${EASE}; transition-delay: var(--rv-delay, 0ms); }
    .rv.rv-in { opacity: 1; translate: 0 0; }
    .float-soft { animation: floatSoft 5s ease-in-out infinite; }
    @keyframes floatSoft { 0%, 100% { translate: 0 0; } 50% { translate: 0 -6px; } }
    .draw { background-repeat: no-repeat; background-position: 0 0; background-size: 0% 100%; transition: background-size 1s ${EASE}; transition-delay: var(--draw-delay, 0ms); }
    .draw.draw-in { background-size: 100% 100%; }
    .mq { overflow: hidden; -webkit-mask-image: linear-gradient(90deg, transparent, #000 6%, #000 94%, transparent); mask-image: linear-gradient(90deg, transparent, #000 6%, #000 94%, transparent); }
    .mq-track { display: flex; width: max-content; animation: mqScroll var(--mq-duration, 40s) linear infinite; }
    .mq-group { display: flex; flex: none; align-items: center; white-space: nowrap; }
    .mq:hover .mq-track { animation-play-state: paused; }
    @keyframes mqScroll { to { transform: translateX(-50%); } }
    #scroll-progress { position: fixed; top: 0; left: 0; height: 3px; width: 100%; transform-origin: 0 50%; transform: scaleX(0); background: ${accent}; z-index: 9999; pointer-events: none; }
  `;
  document.head.appendChild(style);

  // Thin scroll-progress bar (kept even with reduced motion; it is not decorative movement)
  const bar = document.createElement('div');
  bar.id = 'scroll-progress';
  document.body.appendChild(bar);
  let ticking = false;
  const updateBar = () => {
    const max = document.documentElement.scrollHeight - innerHeight;
    bar.style.transform = `scaleX(${max > 0 ? Math.min(1, scrollY / max) : 0})`;
    ticking = false;
  };
  addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(updateBar); } }, { passive: true });
  updateBar();

  if (reduceMotion) return;

  const sections = [...document.querySelectorAll('section')].filter(s => !s.closest('header, footer, nav'));
  const hero = sections.find(s => s.querySelector('h1'));
  const marked = new Set();
  const skip = el => el.closest('header, nav, #mobile-menu, table, details, [data-no-reveal]') || marked.has(el);

  function mark(el, delay) {
    if (skip(el)) return;
    for (const m of marked) if (m.contains(el)) return; // parent already animates
    el.classList.add('rv');
    el.style.setProperty('--rv-delay', delay + 'ms');
    marked.add(el);
  }

  // 1. Hero entrance: the h1 and its siblings, then the other column (only when the hero is a grid/row;
  //    if the h1 sits directly in the section there is no "other column" to animate)
  if (hero) {
    const h1 = hero.querySelector('h1');
    [...h1.parentElement.children].forEach((el, i) => mark(el, 80 + i * 110));
    const grid = h1.parentElement.parentElement;
    if (h1.parentElement !== hero && hero.contains(grid)) {
      [...grid.children].filter(c => !c.contains(h1)).forEach((el, i) => mark(el, 350 + i * 120));
    }
  }

  // 2. Scroll reveals for every other section: headings, intro text and grid items (staggered)
  sections.filter(s => s !== hero).forEach(section => {
    const items = section.querySelectorAll('h2, h2 + p, .grid > *, [data-reveal]');
    if (!items.length) { mark(section, 0); return; }
    items.forEach(el => {
      const parent = el.parentElement;
      const index = parent && parent.classList.contains('grid') ? [...parent.children].indexOf(el) : 0;
      mark(el, Math.min(index, 5) * 90);
    });
  });

  const revealer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      revealer.unobserve(el);
      el.classList.add('rv-in');
      // Drop the reveal classes afterwards so hover effects have no delay
      const delay = parseInt(el.style.getPropertyValue('--rv-delay'), 10) || 0;
      setTimeout(() => { el.classList.remove('rv', 'rv-in'); el.style.removeProperty('--rv-delay'); }, delay + 900);
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
  marked.forEach(el => revealer.observe(el));

  // 3. Count-up for big stat numbers (e.g. "94.2%", "₹2,400 Cr+", "500+"); ordinals like "7th" are left alone
  const counters = [...document.querySelectorAll('main *, section *')].filter(el => {
    if (el.children.length || el.closest('header, footer, form, table, button, a, [data-no-count]')) return false;
    const text = el.textContent.trim();
    return text.length <= 14 && /\d/.test(text) && parseFloat(getComputedStyle(el).fontSize) >= 24
      && /^[^\d]*\d[\d,]*(\.\d+)?[^\d]*$/.test(text) && !/\d(st|nd|rd|th)\b/i.test(text);
  });
  const countUp = el => {
    const text = el.textContent.trim();
    const [, pre, num, post] = text.match(/^([^\d]*)(\d[\d,]*(?:\.\d+)?)(.*)$/);
    const target = parseFloat(num.replace(/,/g, ''));
    if (!target) return;
    const decimals = (num.split('.')[1] || '').length;
    const useCommas = num.includes(',');
    const start = performance.now(), duration = 1400;
    const frame = now => {
      if (!el.isConnected) return; // re-rendered by the page meanwhile
      const t = Math.min(1, (now - start) / duration);
      const value = target * (1 - Math.pow(1 - t, 3));
      const shown = useCommas ? value.toLocaleString('en-IN', { maximumFractionDigits: decimals, minimumFractionDigits: decimals })
                              : value.toFixed(decimals);
      el.textContent = pre + shown + post;
      if (t < 1) requestAnimationFrame(frame); else el.textContent = text;
    };
    requestAnimationFrame(frame);
  };
  const counterObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      counterObserver.unobserve(entry.target);
      countUp(entry.target);
    });
  }, { threshold: 0.6 });
  counters.forEach(el => counterObserver.observe(el));

  // 4. Gentle hover lift on cards (bordered/shadowed rounded boxes that are not huge bands or forms).
  //    Re-applied to cards the page renders later (e.g. a pricing toggle).
  const CARD = '[class*="rounded-2xl"], [class*="rounded-3xl"], [class*="rounded-xl"]';
  const applyLift = root => {
    const els = [...root.querySelectorAll(CARD)];
    if (root.matches && root.matches(CARD)) els.push(root);
    els.forEach(el => {
      const cls = el.className;
      if (typeof cls !== 'string' || !/\b(border|shadow)/.test(cls) || !el.closest('section')) return;
      if (el.closest('header, form, table') || el.querySelector('form, input, select, textarea, video')) return;
      if (el.offsetWidth > 640 || el === hero) return;
      el.classList.add('lift');
    });
  };
  sections.forEach(applyLift);
  new MutationObserver(records => records.forEach(r => r.addedNodes.forEach(n => {
    if (n.nodeType === 1) {
      applyLift(n);
      n.querySelectorAll('.sticker').forEach(s => s.classList.add('float-soft'));
    }
  }))).observe(document.querySelector('main') || document.body, { childList: true, subtree: true });

  // 5. Soft floating stickers / badges
  document.querySelectorAll('.sticker').forEach(el => el.classList.add('float-soft'));

  // 6. Highlighter draw-in: gradient highlights sweep in left to right; the final look is unchanged
  const drawer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      drawer.unobserve(entry.target);
      entry.target.classList.add('draw-in');
    });
  }, { threshold: 0.6 });
  document.querySelectorAll(drawSelector).forEach(el => {
    if (el.closest('header, footer, nav') || !/gradient/.test(getComputedStyle(el).backgroundImage)) return;
    const host = el.closest('.rv');
    const after = host ? (parseInt(host.style.getPropertyValue('--rv-delay'), 10) || 0) + 450 : 150;
    el.style.setProperty('--draw-delay', after + 'ms');
    el.classList.add('draw');
    drawer.observe(el);
  });

  // 7. Marquee: [data-marquee] strips scroll slowly and seamlessly (pause on hover).
  //    Children marked [data-marquee-only] are hidden in the static version and shown here (e.g. a trailing separator).
  document.querySelectorAll('[data-marquee]').forEach(strip => {
    strip.querySelectorAll('[data-marquee-only]').forEach(el => el.classList.remove('hidden'));
    const items = [...strip.childNodes];
    const group = document.createElement('div');
    group.className = 'mq-group';
    group.style.gap = getComputedStyle(strip).columnGap;
    items.forEach(n => group.appendChild(n));
    const track = document.createElement('div');
    track.className = 'mq-track';
    track.appendChild(group);
    strip.classList.add('mq');
    strip.appendChild(track);
    // Repeat the items until one group is wider than the strip, then clone the group for a seamless loop
    const original = [...group.childNodes];
    for (let i = 0; i < 6 && group.scrollWidth < strip.clientWidth + 40; i++) {
      original.forEach(n => {
        const c = n.cloneNode(true);
        if (c.nodeType === 1) c.setAttribute('aria-hidden', 'true');
        group.appendChild(c);
      });
    }
    group.style.paddingRight = group.style.gap;
    const clone = group.cloneNode(true);
    clone.setAttribute('aria-hidden', 'true');
    track.appendChild(clone);
    const pxPerSecond = parseFloat(strip.dataset.marquee) || 40;
    track.style.setProperty('--mq-duration', Math.max(10, group.scrollWidth / pxPerSecond) + 's');
  });
})();
