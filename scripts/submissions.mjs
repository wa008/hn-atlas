import {readFile,writeFile} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
import {validateSubmission,CATEGORY_IDS} from '../lib/submission.js';
import {enrichSubmission} from './site-metadata.mjs';
const repo=process.env.GITHUB_REPOSITORY||'wa008/hn-atlas';
const token=process.env.GH_TOKEN;if(!token)throw new Error('GitHub workflow token required');
const event=JSON.parse(await readFile(process.env.GITHUB_EVENT_PATH,'utf8'));
const siteOrigin=process.env.SITE_ORIGIN||'https://hn-atlas.pages.dev';
async function github(path,method='GET',body){const r=await fetch(`https://api.github.com/repos/${repo}${path}`,{method,headers:{Authorization:`Bearer ${token}`,Accept:'application/vnd.github+json','Content-Type':'application/json','X-GitHub-Api-Version':'2022-11-28'},body:body?JSON.stringify(body):undefined});if(!r.ok)throw new Error(`GitHub ${method} ${path}: ${r.status}`);return r.status===204?null:r.json();}
async function identity(){const url=new URL(process.env.ACTIONS_ID_TOKEN_REQUEST_URL);url.searchParams.set('audience','hn-atlas-review');const r=await fetch(url,{headers:{Authorization:`Bearer ${process.env.ACTIONS_ID_TOKEN_REQUEST_TOKEN}`}});if(!r.ok)throw new Error('GitHub OIDC unavailable');return (await r.json()).value;}
async function queue(method='GET',body){const jwt=await identity();let r;for(let attempt=0;attempt<7;attempt++){r=await fetch(`${siteOrigin}/api/review`,{method,headers:{Authorization:`Bearer ${jwt}`,'Content-Type':'application/json'},body:body?JSON.stringify(body):undefined});if(method==='GET'&&(r.status===404||r.status>=500)&&attempt<6){await new Promise(resolve=>setTimeout(resolve,10000));continue;}break;}if(!r.ok)throw new Error(`Submission queue: ${r.status}`);return r.json();}
const marker=id=>`<!-- hn-atlas-submission:${id} -->`;
async function ensureLabels(){for(const [name,color]of[['submission','D4C5F9'],['approved','0E8A16'],['rejected','B60205'],['published','1D76DB']]){try{await github(`/labels/${name}`);}catch(error){if(!error.message.endsWith('404'))throw error;await github('/labels','POST',{name,color});}}}
async function intake(){
  const {submissions}=await queue();if(!submissions.length){console.log('No queued suggestions.');return;}
  await ensureLabels();
  let issues=[];for(let page=1;page<=10;page++){const batch=await github(`/issues?state=all&labels=submission&per_page=100&page=${page}`);issues.push(...batch);if(batch.length<100)break;}
  for(const item of submissions){
    const {site,generated}=await enrichSubmission(item);let issue=issues.find(issue=>issue.body?.includes(marker(item.id)));
    if(!issue){const body=[marker(item.id),'## Anonymous site suggestion','', 'Review the URL and generated draft below. **Category is required before approval.** Edit the JSON, then add **approved** to publish or **rejected** to close.', '', `Allowed categories: ${CATEGORY_IDS.map(id=>'\u0060'+id+'\u0060').join(', ')}`, '', `Auto-filled draft fields: ${generated.join(', ')||'none (provided by submitter)'}. Check these against the website.`,'', '```json',JSON.stringify({...site,submissionId:item.id},null,2),'```','', 'Approval confirms that the site is available, directly related to HN, and worth listing. The approval workflow validates the entry before committing it.'].join('\n');issue=await github('/issues','POST',{title:`[Submission] ${site.name}`,body,labels:['submission']});issues.push(issue);}
    await queue('POST',{id:item.id,issueNumber:issue.number,status:'reviewing'});console.log(`Queued suggestion ${item.id} → issue #${issue.number}`);
  }
}
async function moderate(){
  const issue=event.issue;const label=event.label?.name;if(!issue||!['approved','rejected'].includes(label))return;
  const actor=event.sender.login;const {permission}=await github(`/collaborators/${encodeURIComponent(actor)}/permission`);if(!['admin','maintain','write'].includes(permission))throw new Error('Only repository maintainers may publish suggestions.');
  if(!issue.labels.some(label=>label.name==='submission')||issue.state!=='open')return;
  const fresh=await github(`/issues/${issue.number}`);const match=fresh.body?.match(/```json\s*\n([\s\S]*?)\n```/);if(!match)throw new Error('Submission JSON is missing.');
  const proposal=JSON.parse(match[1]);let site=validateSubmission(proposal);const receipt=proposal.submissionId;
  if(!/^[a-f0-9-]{36}$/.test(receipt||'')||!fresh.body.includes(marker(receipt)))throw new Error('Receipt does not match this issue.');
  if(label==='rejected'){await queue('POST',{id:receipt,issueNumber:issue.number,status:'rejected'});await github(`/issues/${issue.number}`,'PATCH',{state:'closed',state_reason:'not_planned'});return;}
  if(!fresh.labels.some(label=>label.name==='approved'))return;
  site=(await enrichSubmission(validateSubmission(proposal,{requireCategory:true}))).site;
  const path=new URL('../data/sites.json',import.meta.url);const data=JSON.parse(await readFile(path,'utf8'));
  const existing=data.sites.find(entry=>entry.url===site.url||entry.submissionId===receipt);
  if(!existing){
    const date=new Date().toISOString().slice(0,10);const id=`${site.name.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,45)||'site'}-${receipt.slice(0,8)}`;
    data.sites.push({id,name:site.name,category:site.category,url:site.url,description:site.description,activity:{type:'review',date,url:fresh.html_url,note:`Availability and relevance reviewed by @${actor}.`},popularity:{type:'editor_pick',url:site.source||fresh.html_url,note:`Approved by @${actor} in issue #${issue.number}; editorial selection, not a popularity score.`},domainRating:null,submissionId:receipt});
    data.reviewedOn=date;await writeFile(path,JSON.stringify(data,null,2)+'\n');
    execFileSync('npm',['run','check'],{stdio:'inherit'});
    execFileSync('git',['config','user.name','github-actions[bot]']);execFileSync('git',['config','user.email','41898282+github-actions[bot]@users.noreply.github.com']);
    execFileSync('git',['add','data/sites.json','README.md']);execFileSync('git',['commit','-m',`Add ${site.name} (approved #${issue.number})`],{stdio:'inherit'});execFileSync('git',['push','origin','HEAD:main'],{stdio:'inherit'});
  }
  await queue('POST',{id:receipt,issueNumber:issue.number,status:'published'});
  await github(`/issues/${issue.number}/labels`,'POST',{labels:['published']});
  await github(`/issues/${issue.number}/comments`,'POST',{body:`Approved by @${actor} and added to the directory. Cloudflare automatically deploys the main branch: ${siteOrigin}`});
  await github(`/issues/${issue.number}`,'PATCH',{state:'closed',state_reason:'completed'});
}
try{if(process.env.GITHUB_EVENT_NAME==='issues')await moderate();else await intake();}catch(error){if(event.issue?.number&&event.label?.name==='approved')await github(`/issues/${event.issue.number}/comments`,'POST',{body:'Publication did not complete. Check this workflow run, correct the submission JSON if needed, and remove/re-add the approved label to retry.'}).catch(()=>{});throw error;}
