'use strict';

(() => {
  const form = document.querySelector('#people-search');
  const input = document.querySelector('#people-query');
  const count = document.querySelector('#people-count');
  const empty = document.querySelector('#people-empty');
  const normalize = (value) => value.normalize('NFKC').toLowerCase();
  const members = Array.from(document.querySelectorAll('#people-list .person-card'), (card) => ({
    card,
    text: normalize(`${card.textContent} ${card.dataset.keywords || ''}`)
  }));

  function render() {
    const words = normalize(input.value).trim().split(/\s+/).filter(Boolean);
    let matches = 0;
    for (const { card, text } of members) {
      const visible = words.every((word) => text.includes(word));
      card.hidden = !visible;
      if (visible) matches++;
    }
    count.textContent = `${matches} 位群友`;
    empty.hidden = matches !== 0;
  }

  form.hidden = false;
  input.addEventListener('input', render);
  form.addEventListener('submit', (event) => event.preventDefault());
  document.querySelector('#people-reset').addEventListener('click', () => {
    input.value = '';
    render();
    input.focus();
  });
  render();
})();
