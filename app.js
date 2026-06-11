const siteData = window.QA_SITE_DATA || {questions: []};
const questions = Array.isArray(siteData.questions) ? siteData.questions : [];
const qaList = document.getElementById('qaList');
const searchInput = document.getElementById('searchInput');
const resultLine = document.getElementById('resultLine');
const emptyState = document.getElementById('emptyState');
const filterButtons = Array.from(document.querySelectorAll('.filter-pill'));
const navLinks = Array.from(document.querySelectorAll('[data-filter-link]'));
let cards = [];
let currentFilter = 'All';

function normalize(value) {
  return String(value || '').toLocaleLowerCase('ru-RU').trim();
}

function escapeHtml(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function indexLabel(index) {
  return String(index).padStart(2, '0');
}

function renderCards() {
  qaList.innerHTML = questions.map(question => {
    const id = escapeHtml(question.id);
    const group = escapeHtml(question.group);
    const title = escapeHtml(question.title);
    const path = escapeHtml(question.path || 'Root');
    const readMin = Number(question.read_min || 1);
    const answerHtml = question.answer_html || '';
    const source = escapeHtml(question.source || '');
    const search = escapeHtml(question.search || '');

    return `
      <article class="qa-card" id="${id}" data-group="${group}" data-search="${search}">
        <details>
          <summary>
            <span class="question-index">${indexLabel(question.index)}</span>
            <span class="question-main">
              <span class="question-title">${title}</span>
              <span class="question-meta">${group} · ${path} · ${readMin} минут на чтение</span>
            </span>
            <span class="summary-action">Open</span>
          </summary>
          <div class="answer-body">
            ${answerHtml}
            <div class="source-line">Source: ${source}</div>
          </div>
        </details>
      </article>`;
  }).join('');

  cards = Array.from(document.querySelectorAll('.qa-card'));
  cards.forEach(card => {
    card.querySelector('details').addEventListener('toggle', updateLabels);
  });
}

function updateLabels() {
  cards.forEach(card => {
    const details = card.querySelector('details');
    const action = card.querySelector('.summary-action');
    if (action) action.textContent = details.open ? 'Close' : 'Open';
  });
}

function setFilter(filter) {
  currentFilter = filter;
  filterButtons.forEach(button => {
    button.classList.toggle('active', button.dataset.filter === filter);
  });
  navLinks.forEach(link => {
    link.classList.toggle('active', link.dataset.filterLink === filter);
  });
  applyFilters();
}

function applyFilters() {
  const query = normalize(searchInput.value);
  let visible = 0;
  cards.forEach(card => {
    const matchesGroup = currentFilter === 'All' || card.dataset.group === currentFilter;
    const matchesSearch = !query || normalize(card.dataset.search).includes(query);
    const shouldShow = matchesGroup && matchesSearch;
    card.hidden = !shouldShow;
    if (shouldShow) visible += 1;
  });
  const total = cards.length;
  const scope = currentFilter === 'All' ? 'all sections' : currentFilter;
  resultLine.textContent = `Показано ${visible} из ${total} вопросов для ${scope}`;
  emptyState.hidden = visible !== 0;
}

searchInput.addEventListener('input', applyFilters);
filterButtons.forEach(button => {
  button.addEventListener('click', () => setFilter(button.dataset.filter));
});
navLinks.forEach(link => {
  link.addEventListener('click', () => setFilter(link.dataset.filterLink));
});

document.getElementById('expandAll').addEventListener('click', () => {
  cards.filter(card => !card.hidden).forEach(card => card.querySelector('details').open = true);
  updateLabels();
});

document.getElementById('collapseAll').addEventListener('click', () => {
  cards.forEach(card => card.querySelector('details').open = false);
  updateLabels();
});

function openCardFromHash() {
  if (!window.location.hash) return;
  const id = decodeURIComponent(window.location.hash.slice(1));
  const target = document.getElementById(id);
  if (target && target.classList.contains('qa-card')) {
    target.querySelector('details').open = true;
    setTimeout(() => target.scrollIntoView({block: 'start'}), 50);
  }
}

renderCards();
updateLabels();
applyFilters();
openCardFromHash();
