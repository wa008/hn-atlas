const search = document.querySelector('#search');
const buttons = [...document.querySelectorAll('[data-filter]')];
const items = [...document.querySelectorAll('.site-item')];
const categories = [...document.querySelectorAll('.category')];
const columns = [...document.querySelectorAll('.directory-column')];
const status = document.querySelector('#result-status');
const url = new URL(location.href);
let selected = buttons.some(button => button.dataset.filter === url.searchParams.get('section')) ? url.searchParams.get('section') : 'all';
search.value = url.searchParams.get('q') || '';

function filterSites() {
  const query = search.value.trim().toLowerCase();
  let matches = 0;
  for (const item of items) {
    item.hidden = (selected !== 'all' && item.dataset.group !== selected) || !item.dataset.search.includes(query);
    if (!item.hidden) matches += 1;
  }
  for (const category of categories) category.hidden = !category.querySelector('.site-item:not([hidden])');
  for (const column of columns) column.hidden = !column.querySelector('.site-item:not([hidden])');
  for (const button of buttons) { const active = button.dataset.filter === selected; button.classList.toggle('active', active); button.setAttribute('aria-pressed', String(active)); }
  document.querySelector('#empty').hidden = matches > 0;
  status.textContent = `${matches} ${matches === 1 ? 'site' : 'sites'}`;
  const nextUrl = new URL(location.href);
  if (query) nextUrl.searchParams.set('q', search.value.trim()); else nextUrl.searchParams.delete('q');
  if (selected !== 'all') nextUrl.searchParams.set('section', selected); else nextUrl.searchParams.delete('section');
  history.replaceState(null, '', nextUrl);
}

search.addEventListener('input', filterSites);
buttons.forEach(button => button.addEventListener('click', () => { selected = button.dataset.filter; filterSites(); }));
document.querySelector('#clear-search').addEventListener('click', () => { search.value = ''; selected = 'all'; filterSites(); search.focus(); });
document.addEventListener('keydown', event => {
  if (event.key === '/' && !event.metaKey && !event.ctrlKey && !event.altKey && !event.target.closest('input,textarea,[contenteditable]')) { event.preventDefault(); search.focus(); }
  if (event.key === 'Escape' && document.activeElement === search) { search.value = ''; filterSites(); search.blur(); }
});
filterSites();
