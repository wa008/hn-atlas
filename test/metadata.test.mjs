import test from 'node:test';
import assert from 'node:assert/strict';
import {EventEmitter} from 'node:events';
import {validateSubmission} from '../lib/submission.js';
import {extractMetadata,enrichSubmission,isPublicAddress,readPublicHtml} from '../scripts/site-metadata.mjs';

test('A URL-only suggestion is accepted, but cannot publish without a moderator category',()=>{
  const draft=validateSubmission({url:'https://example.com/'});
  assert.deepEqual(draft,{url:'https://example.com/',name:'',description:'',category:'',source:''});
  assert.throws(()=>validateSubmission(draft,{requireCategory:true}),/category before publishing/);
  assert.equal(validateSubmission({...draft,category:'books'},{requireCategory:true}).category,'books');
  assert.equal(validateSubmission({...draft,name:'X',description:'My pick.'}).description,'My pick.');
});
test('Metadata reads quoted attributes in either order, entities, and title fallbacks',()=>{
  const html='<title>A longer title</title><meta content="Small &amp; Useful" property="og:site_name"><meta name="description" content="A calm place&#10;to find useful links.">';
  assert.deepEqual(extractMetadata(html),{name:'Small & Useful',description:'A calm place to find useful links.'});
  assert.equal(extractMetadata('<title>Example title</title>').name,'Example title');
});
test('Metadata fills only missing text; a failed fetch never blocks a URL-only suggestion',async()=>{
  const html='<title>Discovered name</title><meta name="description" content="A description from the website.">';
  const result=await enrichSubmission({url:'https://example.com/',name:'My chosen name'},{readHtml:async()=>html});
  assert.equal(result.site.name,'My chosen name');assert.equal(result.site.description,'A description from the website.');assert.deepEqual(result.generated,['description']);assert.equal(result.site.category,'');
  const fallback=await enrichSubmission({url:'https://example.com/'},{readHtml:async()=>{throw new Error('Unavailable');}});
  assert.equal(fallback.site.name,'example.com');assert.equal(fallback.site.description,'A website at example.com.');
});
test('Internal destinations and mixed public/private DNS answers are rejected before connecting',async()=>{
  for(const ip of ['127.0.0.1','10.1.2.3','169.254.169.254','192.168.1.1','100.64.1.1','::1','::ffff:127.0.0.1','fd00::1','fe80::1','2001:db8::1'])assert.equal(isPublicAddress(ip),false,ip);
  assert.equal(isPublicAddress('8.8.8.8'),true);
  let connections=0;
  await assert.rejects(readPublicHtml('https://example.com/',{lookup:async()=>[{address:'8.8.8.8',family:4},{address:'127.0.0.1',family:4}],transport:()=>{connections++;}}),/Private destination/);
  assert.equal(connections,0);
});
test('The HTTP connection is pinned to the validated address and redirects cannot reach private hosts',async()=>{
  let pinned;
  const transport=(_url,options,callback)=>{
    options.lookup('example.com',{},(_error,address)=>{pinned=address;});
    const request=new EventEmitter();request.end=()=>{const response=new EventEmitter();response.statusCode=302;response.headers={location:'http://169.254.169.254/latest/meta-data/'};response.resume=()=>{};callback(response);};return request;
  };
  await assert.rejects(readPublicHtml('https://example.com/',{lookup:async()=>[{address:'8.8.8.8',family:4}],transport}),/public website URL/);
  assert.equal(pinned,'8.8.8.8');
});
