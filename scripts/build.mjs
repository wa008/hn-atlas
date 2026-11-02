import {readFile,writeFile,mkdir,copyFile,rm} from 'node:fs/promises';
import assert from 'node:assert/strict';
import {CATEGORY_IDS} from '../lib/submission.js';

const data=JSON.parse(await readFile(new URL('../data/sites.json',import.meta.url),'utf8'));
const escape=value=>String(value).replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
const isDate=value=>typeof value==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(value)&&new Date(value).toISOString().slice(0,10)===value;
const isUrl=value=>{try{return ['https:','http:'].includes(new URL(value).protocol);}catch{return false;}};
assert(isDate(data.reviewedOn),'reviewedOn must be an ISO date');
const categories=new Set();
for(const category of data.categories){assert(category.id&&category.name&&!categories.has(category.id),'Categories need unique IDs and names');categories.add(category.id);}
assert.deepEqual([...categories].sort(),[...CATEGORY_IDS].sort(),'Directory and submission categories must match');
const ids=new Set(),urls=new Set();
for(const site of data.sites){
  assert(/^[a-z0-9-]+$/.test(site.id)&&!ids.has(site.id),`Invalid or duplicate ID: ${site.id}`);ids.add(site.id);
  assert(site.name&&site.description&&site.description.length<=100,`Keep ${site.id} concise`);
  assert(isUrl(site.url)&&!urls.has(site.url),`Invalid or duplicate URL: ${site.id}`);urls.add(site.url);
  assert(categories.has(site.category),`Unknown category: ${site.category}`);
  assert(['launch','repository','release','content','review'].includes(site.activity?.type)&&isDate(site.activity.date)&&isUrl(site.activity.url)&&site.activity.note,`Activity evidence required: ${site.id}`);
  const age=(new Date(data.reviewedOn)-new Date(site.activity.date))/86400000;
  assert(age>=0&&age<=180,`Activity must be within 180 days of review: ${site.id}`);
  const popularity=site.popularity;
  assert(popularity&&isUrl(popularity.url),`Popularity source required: ${site.id}`);
  assert((popularity.type==='hn_points'&&Number.isInteger(popularity.value)&&popularity.value>=50)||(popularity.type==='github_stars'&&Number.isInteger(popularity.value)&&popularity.value>=100)||(popularity.type==='official_service'&&popularity.note)||(popularity.type==='editor_pick'&&popularity.note?.length>=20),`Popularity evidence required: ${site.id}`);
  assert(site.domainRating===null||(Number.isFinite(site.domainRating?.value)&&site.domainRating.value>=0&&site.domainRating.value<=100&&isUrl(site.domainRating.url)&&isDate(site.domainRating.date)),`DR needs a value, source, and date: ${site.id}`);
}
const count=category=>data.sites.filter(site=>site.category===category).length;
const filters=data.categories.filter(category=>count(category.id)).map(category=>`<button class="category-nav" data-filter="${escape(category.id)}" aria-pressed="false"><span>${escape(category.name)}</span><span class="nav-count">${String(count(category.id)).padStart(2,'0')}</span></button>`).join('');
const options=data.categories.filter(category=>count(category.id)).map(category=>`<option value="${escape(category.id)}">${escape(category.name)} (${count(category.id)})</option>`).join('');
const directory=data.categories.map(category=>{
  const sites=data.sites.filter(site=>site.category===category.id);if(!sites.length)return '';
  const entries=sites.map(site=>{
    const host=new URL(site.url).hostname.replace(/^www\./,'');
    const source=site.popularity.url.includes('news.ycombinator.com/item')?'Discussion':'Source';
    return `<li class="site-item" data-category="${escape(category.id)}" data-search="${escape(`${site.name} ${site.description} ${category.name} ${site.url}`.toLowerCase())}"><a class="site-link" href="${escape(site.url)}" target="_blank" rel="noopener noreferrer"><span class="site-name">${escape(site.name)}<span class="site-arrow" aria-hidden="true">↗</span></span><span class="site-description">${escape(site.description)}</span></a><div class="site-meta"><span>${escape(host)}</span><span aria-hidden="true">·</span><a href="${escape(site.popularity.url)}" target="_blank" rel="noopener noreferrer">${source} ↗</a></div></li>`;
  }).join('');
  return `<section class="category" aria-labelledby="category-${escape(category.id)}"><div class="category-heading"><h2 id="category-${escape(category.id)}">${escape(category.name)}</h2><span class="category-count">${sites.length} ${sites.length===1?'site':'sites'}</span></div><ul class="site-list">${entries}</ul></section>`;
}).join('');
const template=await readFile(new URL('../src/index.html',import.meta.url),'utf8');
const date=new Date(`${data.reviewedOn}T12:00:00Z`).toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric',timeZone:'UTC'});
const replacements={OPTIONS:options,TOTAL:data.sites.length,FILTERS:filters,DIRECTORY:directory,REVIEW_DATE:data.reviewedOn,DISPLAY_DATE:date};
const html=template.replace(/\{\{([A-Z_]+)\}\}/g,(_,key)=>{assert(key in replacements,`Unknown template marker ${key}`);return replacements[key];});
const htmlIds=[...html.matchAll(/\sid="([^"]+)"/g)].map(match=>match[1]);assert(new Set(htmlIds).size===htmlIds.length,'Rendered HTML must have unique IDs');
const output=new URL('../dist/',import.meta.url);await rm(output,{recursive:true,force:true});await mkdir(output,{recursive:true});
await writeFile(new URL('index.html',output),html);
for(const file of ['app.js','style.css','favicon.svg','_headers'])await copyFile(new URL(`../src/${file}`,import.meta.url),new URL(file,output));
await writeFile(new URL('data.json',output),JSON.stringify(data,null,2)+'\n');
await writeFile(new URL('404.html',output),'<!doctype html><html lang="en"><meta charset="utf-8"><title>Page not found — HN Atlas</title><h1>Page not found.</h1><a href="/">Back to the directory</a></html>');
const markdown=data.categories.map(category=>{const sites=data.sites.filter(site=>site.category===category.id);return sites.length?`### ${category.name}\n\n${sites.map(site=>`- [${site.name}](${site.url}) — ${site.description}`).join('\n')}\n`:'';}).filter(Boolean).join('\n');
const readme=new URL('../README.md',import.meta.url);const text=await readFile(readme,'utf8');await writeFile(readme,text.replace(/<!-- DIRECTORY:START -->[\s\S]*?<!-- DIRECTORY:END -->/,`<!-- DIRECTORY:START -->\n${markdown}\n<!-- DIRECTORY:END -->`));
console.log(`Built ${data.sites.length} sites in ${data.categories.length} flat categories.`);
