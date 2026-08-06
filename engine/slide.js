/**
 * engine/slide.js — コアエンジン層（編集不要）
 * キーボード操作 / クリックナビ / フルスクリーン / ビューポートスケーリング / PDF書き出し
 */
(() => {
  const slides = () => [...document.querySelectorAll('.slide')];
  let cur = 0;

  function ensureSemantics() {
    const all = slides();
    all.forEach((slide, index) => {
      const heading = slide.querySelector('h1, h2, h3');
      const title = heading?.textContent?.trim() || `Untitled slide ${index + 1}`;
      slide.setAttribute('role', 'region');
      slide.setAttribute('aria-roledescription', 'slide');
      slide.setAttribute('aria-label', `Slide ${index + 1} of ${all.length}: ${title}`);
      if (!slide.id) slide.id = `slide-${index + 1}`;
    });
    if (!document.getElementById('slide-status')) {
      const status = document.createElement('p');
      status.id = 'slide-status';
      status.className = 'sr-only';
      status.setAttribute('aria-live', 'polite');
      status.setAttribute('aria-atomic', 'true');
      document.body.appendChild(status);
    }
  }

  function show(n) {
    const all = slides();
    cur = Math.max(0, Math.min(n, all.length - 1));
    all.forEach((s, i) => {
      const active = i === cur;
      s.classList.toggle('is-active', active);
      s.toggleAttribute('inert', !active);
      s.setAttribute('aria-hidden', String(!active));
      if (active) s.setAttribute('aria-current', 'page');
      else s.removeAttribute('aria-current');
    });
    const el = document.querySelector('.slide-counter');
    if (el) el.textContent =
      `${String(cur + 1).padStart(2, '0')} / ${String(all.length).padStart(2, '0')}`;
    const status = document.getElementById('slide-status');
    if (status) status.textContent = all[cur]?.getAttribute('aria-label') || '';
    history.replaceState(null, '', `#${all[cur]?.id || `slide-${cur + 1}`}`);
    requestAnimationFrame(() => window.scrollTo(0, 0));
  }

  const next = () => show(cur + 1);
  const prev = () => show(cur - 1);

  // ── キーボード ──
  document.addEventListener('keydown', e => {
    if (e.target.matches?.('input[type="radio"]') && ['ArrowRight', 'ArrowDown', 'ArrowLeft', 'ArrowUp'].includes(e.key)) {
      e.preventDefault();
      const radio = e.target;
      const scope = radio.closest('fieldset, .slide, form') || document;
      const group = [...scope.querySelectorAll(`input[type="radio"][name="${CSS.escape(radio.name)}"]`)]
        .filter((input) => !input.disabled);
      const direction = ['ArrowRight', 'ArrowDown'].includes(e.key) ? 1 : -1;
      const nextRadio = group[(group.indexOf(radio) + direction + group.length) % group.length];
      nextRadio.checked = true;
      nextRadio.focus();
      nextRadio.dispatchEvent(new Event('change', { bubbles: true }));
      return;
    }
    if (e.target.closest?.('input, select, textarea, button, a, [contenteditable="true"], [role="radio"]')) return;
    if (['ArrowRight', 'ArrowDown', ' '].includes(e.key)) { e.preventDefault(); next(); }
    if (['ArrowLeft', 'ArrowUp'].includes(e.key))         { e.preventDefault(); prev(); }
    if (e.key === 'Home')                                 { e.preventDefault(); show(0); }
    if (e.key === 'End')                                  { e.preventDefault(); show(slides().length - 1); }
    if (e.key === 'f' || e.key === 'F')                   { toggleFullscreen(); }
    if (e.key === 'g' || e.key === 'G')                   { document.body.classList.toggle('grid-on'); }
  });

  // ── デッキクリック（ナビUI除く）──
  document.querySelector('.deck')?.addEventListener('click', e => {
    if (e.target.closest('.slide-ui')) return;
    if (e.target.closest('input, select, textarea, button, a, label, [role="radio"], [role="button"]')) return;
    next();
  });

  // ── ナビボタン ──
  document.getElementById('btn-prev')?.addEventListener('click', prev);
  document.getElementById('btn-next')?.addEventListener('click', next);
  document.getElementById('btn-fs')?.addEventListener('click', toggleFullscreen);
  document.getElementById('btn-pdf')?.addEventListener('click', exportPDF);

  // ── フルスクリーン ──
  function toggleFullscreen() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen();
    }
  }

  // ── PDF書き出し ──
  function exportPDF() {
    const params = new URLSearchParams(window.location.search);
    const scale = parseFloat(params.get('print-scale')) || 100;

    if (scale !== 100) {
      const factor = scale / 100;
      const style = document.createElement('style');
      style.id = 'print-scale-override';
      style.textContent = `
        @media print {
          @page { size: ${254 * factor}mm ${142.875 * factor}mm; }
          .slide { transform: scale(${factor}); transform-origin: top left; }
        }
      `;
      document.head.appendChild(style);
      requestAnimationFrame(() => {
        window.print();
        const el = document.getElementById('print-scale-override');
        if (el) el.remove();
      });
    } else {
      window.print();
    }
  }

  // ── ビューポートに合わせてスケーリング ──
  function scaleDeck() {
    const deck = document.querySelector('.deck');
    if (!deck) return;
    const scale = Math.min(window.innerWidth / 1280, window.innerHeight / 720);
    deck.style.transform = `scale(${scale})`;
  }

  // ── 各スライドにページ番号を注入 ──
  function injectPageNumbers() {
    const all = slides();
    // デッキが自前のフッター（.slide-footer）を持つなら二重表示になるので注入しない
    const deck = document.querySelector('.deck');
    const hasOwnFooter = !!document.querySelector('.slide-footer');
    if (hasOwnFooter) { deck?.classList.add('has-footer'); return; }
    all.forEach((s, i) => {
      if (s.querySelector('.slide-page-num')) return;
      const span = document.createElement('span');
      span.className = 'slide-page-num';
      span.textContent = String(i + 1).padStart(2, '0');
      s.appendChild(span);
    });
  }

  // ── スライドグリッド・オーバーレイを注入（Gキーで表示） ──
  function injectGrid() {
    const deck = document.querySelector('.deck');
    if (!deck || deck.querySelector('.grid-overlay')) return;
    const cols = Number(getComputedStyle(document.documentElement)
      .getPropertyValue('--grid-cols')) || 12;
    const ov = document.createElement('div');
    ov.className = 'grid-overlay';
    ov.setAttribute('aria-hidden', 'true');
    let spans = '';
    for (let i = 1; i <= cols; i++) spans += `<span data-n="${i}"></span>`;
    ov.innerHTML =
      `<div class="g-base"></div>` +
      `<div class="g-cols">${spans}</div>` +
      `<div class="g-frame"></div>` +
      `<div class="g-label">GRID · G</div>`;
    deck.appendChild(ov);
  }

  window.addEventListener('resize', scaleDeck);
  ensureSemantics();
  window.addEventListener('hashchange', () => {
    const index = slides().findIndex((slide) => `#${slide.id}` === window.location.hash);
    if (index >= 0 && index !== cur) show(index);
  });
  scaleDeck();
  injectPageNumbers();
  injectGrid();
  const hashIndex = slides().findIndex((slide) => `#${slide.id}` === window.location.hash);
  show(hashIndex >= 0 ? hashIndex : 0);

  Promise.all([
    document.fonts?.ready || Promise.resolve(),
    new Promise((resolve) => {
      if (document.documentElement.dataset.chartsReady === 'true' || !document.querySelector('.chart-host')) return resolve();
      const observer = new MutationObserver(() => {
        if (document.documentElement.dataset.chartsReady === 'true') {
          observer.disconnect();
          resolve();
        }
      });
      observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-charts-ready'] });
    }),
    new Promise((resolve) => {
      if (document.documentElement.dataset.awaitExample !== 'true' || document.documentElement.dataset.exampleReady === 'true') return resolve();
      const observer = new MutationObserver(() => {
        if (document.documentElement.dataset.exampleReady === 'true') {
          observer.disconnect();
          resolve();
        }
      });
      observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-example-ready'] });
    }),
  ]).then(() => { document.documentElement.dataset.printReady = 'true'; });
})();
