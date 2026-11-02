import test from 'node:test';
import assert from 'node:assert/strict';
import {validateSubmission} from '../lib/submission.js';
import {verifyGithubIdentity} from '../lib/github-identity.js';
const valid={name:'Example HN',url:'https://example.com/',description:'A useful Hacker News project.',category:'books',source:'https://news.ycombinator.com/item?id=50326821'};
test('Anonymous suggestions reject executable URLs, private destinations, multiline text, and unknown categories',()=>{
  for(const url of ['javascript:alert(1)','https://user:password@example.com/','http://127.0.0.1/','http://localhost/','https://[::1]/'])assert.throws(()=>validateSubmission({...valid,url}));
  assert.throws(()=>validateSubmission({...valid,description:'Hello\n```json\nmalicious'}));
  assert.throws(()=>validateSubmission({...valid,category:'<script>'}));
  assert.throws(()=>validateSubmission({...valid,name:{toString:'attack'}}));
  assert.equal(validateSubmission({...valid,url:'https://example.com/#tracking'}).url,'https://example.com/');
});
const keys=await crypto.subtle.generateKey({name:'RSASSA-PKCS1-v1_5',modulusLength:2048,publicExponent:new Uint8Array([1,0,1]),hash:'SHA-256'},true,['sign','verify']);
const jwk={...await crypto.subtle.exportKey('jwk',keys.publicKey),kid:'test-key',use:'sig'};
const now=Date.now();
const claims={iss:'https://token.actions.githubusercontent.com',aud:'hn-atlas-review',exp:Math.floor(now/1000)+300,nbf:Math.floor(now/1000)-10,repository:'wa008/awesome-hn',repository_id:'1443332515',ref:'refs/heads/main',workflow_ref:'wa008/awesome-hn/.github/workflows/submissions.yml@refs/heads/main',event_name:'schedule'};
const encode=value=>Buffer.from(JSON.stringify(value)).toString('base64url');
async function sign(payload=claims,header={alg:'RS256',kid:'test-key'}){const unsigned=`${encode(header)}.${encode(payload)}`;const signature=await crypto.subtle.sign('RSASSA-PKCS1-v1_5',keys.privateKey,new TextEncoder().encode(unsigned));return `${unsigned}.${Buffer.from(signature).toString('base64url')}`;}
const fetcher=async url=>{assert.equal(url,'https://token.actions.githubusercontent.com/.well-known/jwks');return Response.json({keys:[jwk]});};
test('A genuinely signed identity from the exact trusted repository and workflow is accepted',async()=>{assert.equal((await verifyGithubIdentity(await sign(),{fetcher,now})).repository,'wa008/awesome-hn');});
test('Signed tokens from forks, other workflows, branches, audiences, or expired runs cannot read the queue',async()=>{
  for(const change of [{repository:'attacker/fork'},{repository_id:'1'},{workflow_ref:'wa008/awesome-hn/.github/workflows/other.yml@refs/heads/main'},{ref:'refs/heads/feature'},{aud:'another-service'},{exp:Math.floor(now/1000)-1},{event_name:'pull_request'}])await assert.rejects(verifyGithubIdentity(await sign({...claims,...change}),{fetcher,now}));
});
test('A tampered payload, unsigned token, or attacker-selected key is rejected',async()=>{
  const signed=await sign();const parts=signed.split('.');parts[1]=encode({...claims,exp:claims.exp+3600});await assert.rejects(verifyGithubIdentity(parts.join('.'),{fetcher,now}));
  await assert.rejects(verifyGithubIdentity(await sign(claims,{alg:'none',kid:'test-key'}),{fetcher,now}));
  await assert.rejects(verifyGithubIdentity(await sign(claims,{alg:'RS256',kid:'attacker-key'}),{fetcher,now}));
});
