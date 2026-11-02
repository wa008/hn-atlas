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
  if (event.key === '/' && !event.metaKey && !event.ctrlKey && !event.altKey && !event.target.closest('input,textarea,[contenteditable]') && !document.querySelector('dialog[open]')) { event.preventDefault(); search.focus(); }
  if (event.key === 'Escape' && document.activeElement === search) { search.value = ''; filterSites(); search.blur(); }
});
filterSites();

const submitDialog = document.querySelector('#submit-dialog');
const submitForm = document.querySelector('#submit-form');
const submissionMessage = document.querySelector('#submission-message');
document.querySelector('#open-submit').addEventListener('click', () => submitDialog.showModal());
document.querySelector('#close-submit').addEventListener('click', () => submitDialog.close());
submitDialog.addEventListener('click', event => { if (event.target !== submitDialog) return; const rect = submitDialog.getBoundingClientRect(); if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) submitDialog.close(); });
submitForm.addEventListener('submit', async event => {
  event.preventDefault();
  const button = submitForm.querySelector('button[type="submit"]');
  button.disabled = true; button.textContent = 'Sending…'; submissionMessage.hidden = true;
  try {
    const response = await fetch('/api/submissions', {method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(Object.fromEntries(new FormData(submitForm)))});
    const result = await response.json(); if (!response.ok) throw new Error(result.error || 'Could not send. Please try again.');
    submitForm.hidden = true; submissionMessage.replaceChildren();
    const heading = document.createElement('h3'); heading.textContent = 'Thanks. Your suggestion is queued.';
    const note = document.createElement('p'); note.textContent = 'Suggestions are synced to GitHub periodically. A maintainer will review yours before it appears here.';
    submissionMessage.append(heading,note);
    if (result.id) {
      const link = document.createElement('a'); link.textContent = 'View the review queue ↗'; link.href = `https://github.com/wa008/awesome-hn/issues?q=${encodeURIComponent('in:body '+result.id)}`; link.target='_blank';link.rel='noopener noreferrer';submissionMessage.append(link);
      let attempts = 0; const timer = setInterval(async () => { if (++attempts > 12 || !submitDialog.open) { clearInterval(timer); return; } try { const status = await (await fetch('/api/submissions?id='+encodeURIComponent(result.id))).json(); if (status.issueUrl) { link.href = status.issueUrl; link.textContent = 'View your GitHub review ↗'; clearInterval(timer); } } catch {} },10000);
    }
    const another = document.createElement('button'); another.className = 'suggest-another'; another.type = 'button'; another.textContent = 'Suggest another site'; another.addEventListener('click', () => { submitForm.reset(); submitForm.hidden = false; submissionMessage.hidden = true; submitForm.querySelector('[name="name"]').focus(); }); submissionMessage.append(another);
    submissionMessage.hidden = false; submissionMessage.focus();
  } catch (error) { submissionMessage.textContent = error.message; submissionMessage.hidden = false; }
  finally { button.disabled = false; button.textContent = 'Send for review ↗'; }
});
