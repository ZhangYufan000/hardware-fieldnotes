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
  let theme = stored === 'dark' || stored === 'light' ? stored : (prefersDark.matches ? 'dark' : 'light');

  function setTheme(next) {
    theme = next;
    document.documentElement.dataset.theme = next;
    themeButton.textContent = next === 'dark' ? '☀' : '☾';
    themeButton.setAttribute('aria-label', next === 'dark' ? '切换到日间模式' : '切换到夜间模式');
  }

  setTheme(theme);
  themeButton.hidden = false;
  themeButton.addEventListener('click', () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
    writeSetting('hw-notes-theme', theme);
  });
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
