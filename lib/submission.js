export const CATEGORY_IDS = ['books','videos','games','reading','readers','products','search','jobs'];
export const CATEGORY_ALIASES = {knowledge:'books',blogs:'reading',digests:'reading',terminal:'readers',rss:'search'};
export function publicUrl(value, optional = false) {
  if (optional && !value) return '';
  if (typeof value !== 'string' || value.length > 1000) throw new Error('Enter a valid public URL.');
  let url; try { url = new URL(value); } catch { throw new Error('Enter a full URL, including https://.'); }
  const host = url.hostname.toLowerCase();
  if (!['https:','http:'].includes(url.protocol) || url.username || url.password || !host.includes('.') || host === 'localhost' || host.endsWith('.localhost') || host.endsWith('.local') || host.includes(':') || /^\d+(\.\d+){3}$/.test(host)) throw new Error('Use a public website URL without credentials.');
  url.hash = ''; return url.href;
}
export function validateSubmission(input, {requireCategory = false} = {}) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Invalid submission.');
  const text = (key, max) => { const value = input[key]; if (value === undefined || value === null || value === '') return ''; if (typeof value !== 'string' || value.trim().length > max || /[\x00-\x1f\x7f]/.test(value)) throw new Error(`${key === 'name' ? 'Name' : 'Description'} must be one line, up to ${max} characters.`); return value.trim(); };
  const category = typeof input.category === 'string' ? (Object.hasOwn(CATEGORY_ALIASES,input.category) ? CATEGORY_ALIASES[input.category] : input.category) : input.category || '';
  if ((category && !CATEGORY_IDS.includes(category)) || (requireCategory && !category)) throw new Error('Choose a category before publishing.');
  return { name:text('name',60), url:publicUrl(input.url), description:text('description',100), category, source:publicUrl(input.source,true) };
}
