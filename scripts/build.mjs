import { readFile, writeFile, mkdir, copyFile, rm } from 'node:fs/promises';
import assert from 'node:assert/strict';

const data = JSON.parse(await readFile(new URL('../data/sites.json', import.meta.url), 'utf8'));
const escape = value => String(value).replace(/[&<>"']/g, character => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[character]));
const isDate = value => typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value) && new Date(value).toISOString().slice(0,10) === value;
const isUrl = value => { try { return ['https:','http:'].includes(new URL(value).protocol); } catch { return false; } };
assert(isDate(data.reviewedOn), 'reviewedOn must be an ISO date');
const categoryIds = new Set(); const groupIds = new Set();
for (const group of data.groups) {
  assert(group.id && group.name && !groupIds.has(group.id), 'Groups need unique IDs and names'); groupIds.add(group.id);
  for (const category of group.categories) { assert(category.id && category.name && !categoryIds.has(category.id), 'Categories need unique IDs and names'); categoryIds.add(category.id); }
}
const siteIds = new Set(); const siteUrls = new Set();
for (const site of data.sites) {
  assert(/^[a-z0-9-]+$/.test(site.id) && !siteIds.has(site.id), `Invalid or duplicate site ID: ${site.id}`); siteIds.add(site.id);
  assert(site.name && site.description && site.description.length <= 100, `Keep ${site.id} concise`);
  assert(isUrl(site.url) && !siteUrls.has(site.url), `Invalid or duplicate site URL: ${site.id}`); siteUrls.add(site.url);
  assert(categoryIds.has(site.category), `Unknown category: ${site.category}`);
  assert(['launch','repository','release','content'].includes(site.activity?.type) && isDate(site.activity.date) && isUrl(site.activity.url) && site.activity.note, `Activity evidence required: ${site.id}`);
  const activityAge = (new Date(data.reviewedOn) - new Date(site.activity.date)) / 86400000;
  assert(activityAge >= 0 && activityAge <= 180, `Activity evidence must be within 180 days of review: ${site.id}`);
  const popularity = site.popularity;
  assert(popularity && isUrl(popularity.url), `Popularity source required: ${site.id}`);
  assert((popularity.type === 'hn_points' && Number.isInteger(popularity.value) && popularity.value >= 50) || (popularity.type === 'github_stars' && Number.isInteger(popularity.value) && popularity.value >= 100) || (popularity.type === 'official_service' && popularity.note), `Popularity threshold not met: ${site.id}`);
  assert(site.domainRating === null || (Number.isFinite(site.domainRating?.value) && site.domainRating.value >= 0 && site.domainRating.value <= 100 && isUrl(site.domainRating.url) && isDate(site.domainRating.date)), `Domain Rating needs a verified value, source, and date: ${site.id}`);
}
const filters = data.groups.map(group => `<button class="filter" data-filter="${escape(group.id)}" aria-pressed="false">${escape(group.name)} <span>${data.sites.filter(site => group.categories.some(category => category.id === site.category)).length}</span></button>`).join('');
const directory = data.groups.map((group,index) => {
  const sites = data.sites.filter(site => group.categories.some(category => category.id === site.category));
  const sections = group.categories.map(category => {
    const entries = sites.filter(site => site.category === category.id);
    if (!entries.length) return '';
    const list = entries.map(site => `<li class="site-item" data-group="${escape(group.id)}" data-search="${escape(`${site.name} ${site.description} ${category.name} ${site.url}`.toLowerCase())}"><a class="site-link" href="${escape(site.url)}" target="_blank" rel="noopener noreferrer"><span class="site-name">${escape(site.name)}<span class="site-arrow" aria-hidden="true">↗</span></span><span class="site-description">${escape(site.description)}</span></a></li>`).join('');
    return `<section class="category" aria-labelledby="category-${escape(category.id)}"><h3 class="category-heading" id="category-${escape(category.id)}">${escape(category.name)}</h3><ul class="site-list">${list}</ul></section>`;
  }).join('');
  return `<section class="directory-column" data-column="${escape(group.id)}" aria-labelledby="group-${escape(group.id)}"><div class="column-heading"><h2 id="group-${escape(group.id)}"><span class="column-number" aria-hidden="true">0${index+1}</span>${escape(group.name)}</h2><span class="column-count">${sites.length} sites</span></div>${sections}</section>`;
}).join('');
const template = await readFile(new URL('../src/index.html', import.meta.url), 'utf8');
const date = new Date(`${data.reviewedOn}T12:00:00Z`).toLocaleDateString('en-US', {month:'short',day:'numeric',year:'numeric',timeZone:'UTC'});
const replacements = {TOTAL:data.sites.length,FILTERS:filters,DIRECTORY:directory,REVIEW_DATE:data.reviewedOn,DISPLAY_DATE:date};
const html = template.replace(/\{\{([A-Z_]+)\}\}/g, (_,key) => { assert(key in replacements, `Unknown template marker ${key}`); return replacements[key]; });
const htmlIds = [...html.matchAll(/\sid="([^"]+)"/g)].map(match => match[1]);
assert(new Set(htmlIds).size === htmlIds.length, 'Rendered HTML must have unique IDs');
const output = new URL('../dist/', import.meta.url);
await rm(output, {recursive:true,force:true}); await mkdir(output,{recursive:true});
await writeFile(new URL('index.html',output),html);
for (const file of ['app.js','style.css','favicon.svg','_headers']) await copyFile(new URL(`../src/${file}`,import.meta.url),new URL(file,output));
await writeFile(new URL('data.json',output),JSON.stringify(data,null,2)+'\n');
await writeFile(new URL('404.html',output),'<!doctype html><html lang="en"><meta charset="utf-8"><title>Page not found — Awesome HN</title><h1>Page not found.</h1><a href="/">Back to the directory</a></html>');
const markdown = data.groups.map(group => `### ${group.name}\n\n` + group.categories.map(category => {const entries = data.sites.filter(site => site.category === category.id);return entries.length ? `#### ${category.name}\n\n${entries.map(site => `- [${site.name}](${site.url}) — ${site.description}`).join('\n')}\n` : '';}).filter(Boolean).join('\n')).join('\n');
const readme = new URL('../README.md',import.meta.url);
try { const text = await readFile(readme,'utf8'); await writeFile(readme,text.replace(/<!-- DIRECTORY:START -->[\s\S]*?<!-- DIRECTORY:END -->/,`<!-- DIRECTORY:START -->\n${markdown}\n<!-- DIRECTORY:END -->`)); } catch(error) { if(error.code !== 'ENOENT') throw error; }
console.log(`Built ${data.sites.length} reviewed sites in ${data.groups.length} directory columns.`);
