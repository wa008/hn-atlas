import {validateSubmission} from '../../lib/submission.js';
const json = (body,status=200) => Response.json(body,{status,headers:{'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}});
const digest = async text => [...new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(text)))].map(byte=>byte.toString(16).padStart(2,'0')).join('');
export async function onRequestGet({request,env}) {
  const id = new URL(request.url).searchParams.get('id');
  if(!/^[a-f0-9-]{36}$/.test(id||'')) return json({error:'A receipt ID is required.'},400);
  const row = await env.DB.prepare('SELECT status, github_issue FROM submissions WHERE id = ?').bind(id).first();
  return row ? json({status:row.status,issueUrl:row.github_issue?`https://github.com/wa008/awesome-hn/issues/${row.github_issue}`:null}) : json({error:'Receipt not found.'},404);
}
export async function onRequestPost({request,env}) {
  if(request.headers.get('Origin') && request.headers.get('Origin') !== new URL(request.url).origin) return json({error:'Submit from HN Atlas.'},403);
  if(!request.headers.get('Content-Type')?.startsWith('application/json')) return json({error:'JSON required.'},415);
  const reader=request.body?.getReader(); if(!reader) return json({error:'Submission required.'},400);
  let size=0;const chunks=[];
  while(true){const {done,value}=await reader.read();if(done)break;size+=value.length;if(size>8192){await reader.cancel();return json({error:'Submission is too large.'},413);}chunks.push(value);}
  const bytes=new Uint8Array(size);let offset=0;for(const chunk of chunks){bytes.set(chunk,offset);offset+=chunk.length;}
  let input,site;try{input=JSON.parse(new TextDecoder().decode(bytes));if(input.website)return json({received:true},202);site=validateSubmission(input);}catch(error){return json({error:error.message},400);}
  const now=Date.now();const id=crypto.randomUUID();
  const ipHash=await digest(`${request.headers.get('CF-Connecting-IP')||'local'}:${Math.floor(now/86400000)}:hn-atlas`);
  const dedupe=await digest(`${site.url}:${Math.floor(now/86400000)}`);
  const existing=await env.DB.prepare('SELECT id FROM submissions WHERE dedupe = ?').bind(dedupe).first();if(existing)return json({received:true,id:existing.id},202);
  const result=await env.DB.prepare("INSERT INTO submissions (id,created_at,name,url,description,category,source,ip_hash,dedupe,status) SELECT ?,?,?,?,?,?,?,?,?,'queued' WHERE (SELECT COUNT(*) FROM submissions WHERE ip_hash = ? AND created_at > ?) < 5").bind(id,now,site.name,site.url,site.description,site.category,site.source,ipHash,dedupe,ipHash,now-3600000).run();
  if(!result.meta.changes)return json({error:'Too many submissions. Please try again later.'},429);
  return json({received:true,id},202);
}
