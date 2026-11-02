import {verifyGithubIdentity} from '../../lib/github-identity.js';
const json=(body,status=200)=>Response.json(body,{status,headers:{'Cache-Control':'no-store'}});
export async function onRequest({request,env}) {
  try{const token=request.headers.get('Authorization')?.replace(/^Bearer /,'');await verifyGithubIdentity(token);}catch{return json({error:'Unauthorized'},401);}
  if(request.method==='GET'){
    const {results}=await env.DB.prepare("SELECT id,created_at,name,url,description,category,source FROM submissions WHERE status = 'queued' ORDER BY created_at LIMIT 20").all();
    return json({submissions:results});
  }
  if(request.method==='POST'){
    let body;try{body=await request.json();}catch{return json({error:'Invalid JSON'},400);}
    if(!/^[a-f0-9-]{36}$/.test(body.id||'')||!Number.isSafeInteger(body.issueNumber)||body.issueNumber<1||!['reviewing','published','rejected'].includes(body.status))return json({error:'Invalid receipt'},400);
    await env.DB.prepare('UPDATE submissions SET github_issue = ?, status = ? WHERE id = ?').bind(body.issueNumber,body.status,body.id).run();
    await env.DB.prepare("UPDATE submissions SET ip_hash = '' WHERE created_at < ?").bind(Date.now()-86400000).run();
    return json({ok:true});
  }
  return json({error:'Method not allowed'},405);
}
