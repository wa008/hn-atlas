const search=document.querySelector('#search');
const buttons=[...document.querySelectorAll('[data-filter]')];
const items=[...document.querySelectorAll('.site-item')];
const categories=[...document.querySelectorAll('.category')];
const categorySelect=document.querySelector('#category-select');
const status=document.querySelector('#result-status');
const url=new URL(location.href);
const legacyCategories={blogs:'reading',digests:'reading',terminal:'readers',rss:'search'};
const requested=url.searchParams.get('category');
const initial=Object.hasOwn(legacyCategories,requested)?legacyCategories[requested]:requested;
let selected=buttons.some(button=>button.dataset.filter===initial)?initial:'all';
search.value=url.searchParams.get('q')||'';
function filterSites(){
  const query=search.value.trim().toLowerCase();let matches=0;
  for(const item of items){item.hidden=(selected!=='all'&&item.dataset.category!==selected)||!item.dataset.search.includes(query);if(!item.hidden)matches++;}
  for(const category of categories)category.hidden=!category.querySelector('.site-item:not([hidden])');
  for(const button of buttons){const active=button.dataset.filter===selected;button.classList.toggle('active',active);button.setAttribute('aria-pressed',String(active));}
  categorySelect.value=selected;document.querySelector('#empty').hidden=matches>0;status.textContent=`${matches} ${matches===1?'site':'sites'}`;
  const next=new URL(location.href);next.searchParams.delete('section');if(query)next.searchParams.set('q',search.value.trim());else next.searchParams.delete('q');if(selected!=='all')next.searchParams.set('category',selected);else next.searchParams.delete('category');history.replaceState(null,'',next);
}
search.addEventListener('input',filterSites);
buttons.forEach(button=>button.addEventListener('click',()=>{selected=button.dataset.filter;filterSites();}));
categorySelect.addEventListener('change',()=>{selected=categorySelect.value;filterSites();});
document.querySelector('#clear-search').addEventListener('click',()=>{search.value='';selected='all';filterSites();search.focus();});
document.addEventListener('keydown',event=>{if(event.key==='/'&&!event.metaKey&&!event.ctrlKey&&!event.altKey&&!event.target.closest('input,textarea,[contenteditable]')){event.preventDefault();search.focus();}if(event.key==='Escape'&&document.activeElement===search){search.value='';filterSites();search.blur();}});
filterSites();
