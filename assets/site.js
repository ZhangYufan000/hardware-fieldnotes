'use strict';

function readSetting(key) {
  try { return localStorage.getItem(key); } catch { return null; }
}

function writeSetting(key, value) {
  try { localStorage.setItem(key, value); } catch { /* Settings are optional. */ }
}

const themeButton = document.querySelector('[data-theme-toggle]');
if (themeButton) {
  const prefersDark = matchMedia('(prefers-color-scheme: dark)');
  const stored = readSetting('hw-notes-theme');
  const browserColor = document.querySelector('meta[name="theme-color"]');
  let manualTheme = stored === 'dark' || stored === 'light';
  let theme = manualTheme ? stored : (prefersDark.matches ? 'dark' : 'light');

  function setTheme(next) {
    theme = next;
    document.documentElement.dataset.theme = next;
    themeButton.textContent = next === 'dark' ? '☀' : '☾';
    themeButton.setAttribute('aria-label', next === 'dark' ? '切换到日间模式' : '切换到夜间模式');
    if (browserColor) {
      browserColor.content = getComputedStyle(document.documentElement).getPropertyValue('--paper').trim();
    }
  }

  setTheme(theme);
  themeButton.hidden = false;
  themeButton.addEventListener('click', () => {
    manualTheme = true;
    setTheme(theme === 'dark' ? 'light' : 'dark');
    writeSetting('hw-notes-theme', theme);
  });
  prefersDark.addEventListener('change', (event) => {
    if (!manualTheme) setTheme(event.matches ? 'dark' : 'light');
  });
}

const scope = document.querySelector('.scope');
const readingRoute = document.querySelector('.reading-line');
if (scope || readingRoute) {
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');

  if (scope) {
    const controls = scope.querySelector('.scope-controls');
    const buttons = [...controls.querySelectorAll('button')];
    const traces = [...scope.querySelectorAll('[data-signal]')];
    const sweep = scope.querySelector('.scope-sweep');
    const description = scope.querySelector('#scope-description');
    const descriptions = {
      ripple: '当前展示直流电源上的周期性小幅纹波。',
      square: '当前展示在高、低电平之间切换的数字方波。'
    };
    let sweepAnimation;
    let traceAnimation;

    function stopSweep() {
      sweepAnimation?.cancel();
      traceAnimation?.cancel();
    }

    function showTrace(name) {
      stopSweep();
      const activeTrace = traces.find((trace) => trace.dataset.signal === name);
      traces.forEach((trace) => trace.toggleAttribute('hidden', trace !== activeTrace));
      buttons.forEach((button) => button.setAttribute('aria-pressed', String(button.dataset.trace === name)));
      if (description.textContent !== descriptions[name]) description.textContent = descriptions[name];
      if (reducedMotion.matches || !sweep.animate) return;
      sweepAnimation = sweep.animate([
        { transform: 'translateX(-100%)', opacity: 0 },
        { transform: 'translateX(-84%)', opacity: .82, offset: .16 },
        { transform: 'translateX(-7%)', opacity: .82, offset: .93 },
        { transform: 'translateX(0)', opacity: 0 }
      ], { duration: 850, easing: 'linear' });
      traceAnimation = activeTrace.animate([{ opacity: .22 }, { opacity: 1 }], {
        duration: 680, easing: 'ease-out'
      });
    }

    controls.hidden = false;
    buttons.forEach((button) => button.addEventListener('click', () => showTrace(button.dataset.trace)));
    reducedMotion.addEventListener('change', (event) => {
      if (event.matches) stopSweep();
    });
    showTrace('ripple');
  }

  if (readingRoute && !reducedMotion.matches && 'IntersectionObserver' in window) {
    readingRoute.dataset.traceReady = '';
    const observer = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting)) {
        readingRoute.dataset.traceVisible = '';
        observer.disconnect();
      }
    }, { threshold: .4 });
    observer.observe(readingRoute);
  }
}

const form = document.querySelector('#search');
if (form) {
  const input = form.querySelector('input');
  const controls = document.querySelector('#catalog-controls');
  const filters = [...controls.querySelectorAll('[data-filter]')];
  const notes = [...document.querySelectorAll('.note')];
  const count = document.querySelector('#result-count');
  const empty = document.querySelector('#empty');
  const normalize = (value) => value.normalize('NFKC').toLowerCase();
  const searchTerms = notes.map((note) => normalize(`${note.dataset.keywords} ${note.textContent}`));
  let category = 'all';

  function updateResults() {
    const terms = normalize(input.value).trim().split(/\s+/).filter(Boolean);
    let visible = 0;
    notes.forEach((note, index) => {
      const matchesCategory = category === 'all' || note.dataset.topic === category;
      note.hidden = !(matchesCategory && terms.every((term) => searchTerms[index].includes(term)));
      if (!note.hidden) visible += 1;
    });
    count.textContent = `${visible} 篇笔记`;
    empty.hidden = visible !== 0;
  }

  function setCategory(next) {
    category = next;
    filters.forEach((button) => button.setAttribute('aria-pressed', String(button.dataset.filter === category)));
    updateResults();
  }

  form.hidden = false;
  controls.hidden = false;
  updateResults();
  input.addEventListener('input', updateResults);
  window.addEventListener('pageshow', updateResults);
  form.addEventListener('submit', (event) => { event.preventDefault(); updateResults(); });
  filters.forEach((button) => button.addEventListener('click', () => setCategory(button.dataset.filter)));
  document.querySelector('#clear-search').addEventListener('click', () => {
    input.value = '';
    setCategory('all');
    input.focus();
  });
  document.querySelector('.search-link').addEventListener('click', (event) => {
    if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    input.focus();
  });
  document.addEventListener('keydown', (event) => {
    if (event.defaultPrevented || event.isComposing || event.target.closest('input, textarea, select, [contenteditable]')) return;
    if (event.key === '/' && !event.ctrlKey && !event.metaKey && !event.altKey) {
      event.preventDefault();
      input.focus();
    }
  });
  if (location.hash === '#search') input.focus();
}
