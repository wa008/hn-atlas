import {lookup as dnsLookup} from 'node:dns/promises';
import {request as httpRequest} from 'node:http';
import {request as httpsRequest} from 'node:https';
import {BlockList,isIP} from 'node:net';
import {publicUrl,validateSubmission} from '../lib/submission.js';

const privateRanges=new BlockList();
for(const [address,prefix] of [['0.0.0.0',8],['10.0.0.0',8],['100.64.0.0',10],['127.0.0.0',8],['169.254.0.0',16],['172.16.0.0',12],['192.0.0.0',24],['192.0.2.0',24],['192.168.0.0',16],['198.18.0.0',15],['198.51.100.0',24],['203.0.113.0',24],['224.0.0.0',4],['240.0.0.0',4]]) privateRanges.addSubnet(address,prefix,'ipv4');
const globalV6=new BlockList();globalV6.addSubnet('2000::',3,'ipv6');
const reservedV6=new BlockList();reservedV6.addSubnet('2001:db8::',32,'ipv6');reservedV6.addSubnet('2002::',16,'ipv6');reservedV6.addSubnet('2001::',32,'ipv6');
export function isPublicAddress(address) { const family=isIP(address);return family===4 ? !privateRanges.check(address,'ipv4') : family===6 && globalV6.check(address,'ipv6') && !reservedV6.check(address,'ipv6'); }

export async function readPublicHtml(value,{lookup=dnsLookup,transport}={}) {
  let url=new URL(publicUrl(value));
  for(let hop=0;hop<4;hop++) {
    if(url.port && !['80','443'].includes(url.port)) throw new Error('Unsupported port');
    const records=await lookup(url.hostname,{all:true});
    if(!records.length||records.some(record=>!isPublicAddress(record.address)))throw new Error('Private destination blocked');
    const address=records.find(record=>record.family===4)||records[0];
    const send=transport||(url.protocol==='https:'?httpsRequest:httpRequest);
    const result=await new Promise((resolve,reject)=>{
      const req=send(url,{method:'GET',agent:false,autoSelectFamily:false,lookup:(_hostname,_options,callback)=>callback(null,address.address,address.family),headers:{'User-Agent':'HN-Atlas-Metadata/1.0','Accept':'text/html,application/xhtml+xml','Accept-Encoding':'identity'},signal:AbortSignal.timeout(8000)},response=>{
        const status=response.statusCode;
        if([301,302,303,307,308].includes(status)){response.resume();resolve({redirect:response.headers.location});return;}
        if(status!==200||!/^text\/html|application\/xhtml\+xml/i.test(response.headers['content-type']||'')){response.resume();reject(new Error('HTML unavailable'));return;}
        const chunks=[];let size=0,finished=false;
        const finish=()=>{if(finished)return;finished=true;resolve({html:Buffer.concat(chunks).toString('utf8')});};
        response.on('data',chunk=>{const remaining=131072-size;if(remaining>0){chunks.push(chunk.subarray(0,remaining));size+=Math.min(chunk.length,remaining);}if(size>=131072){finish();response.destroy();}});
        response.on('end',finish);response.on('error',error=>{if(!finished)reject(error);});
      });req.on('error',reject);req.end();
    });
    if(result.html!==undefined)return result.html;
    if(!result.redirect)throw new Error('Invalid redirect');
    url=new URL(publicUrl(new URL(result.redirect,url).href));
  }
  throw new Error('Too many redirects');
}

function clean(value,max) {
  const entities={amp:'&',quot:'"',apos:"'",lt:'<',gt:'>',nbsp:' ',ndash:'–',mdash:'—',rsquo:'’',lsquo:'‘',rdquo:'”',ldquo:'“'};
  return String(value||'').replace(/<[^>]*>/g,' ').replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi,(_,entity)=>{
    if(entity[0]==='#'){const number=entity[1].toLowerCase()==='x'?parseInt(entity.slice(2),16):parseInt(entity.slice(1),10);return number>0&&number<=0x10ffff?String.fromCodePoint(number):' ';}return entities[entity.toLowerCase()]||' ';
  }).replace(/[\x00-\x1f\x7f]/g,' ').replace(/\s+/g,' ').trim().slice(0,max).trim();
}
export function extractMetadata(html) {
  const meta=new Map();
  for(const tag of html.match(/<meta\b[^>]*>/gi)||[]) {
    const attrs={};for(const match of tag.matchAll(/([\w:-]+)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/g))attrs[match[1].toLowerCase()]=match[2]??match[3]??match[4];
    const key=(attrs.property||attrs.name||'').toLowerCase();if(key&&attrs.content&&!meta.has(key))meta.set(key,attrs.content);
  }
  const description=clean(meta.get('og:description')||meta.get('description')||meta.get('twitter:description'),2000);
  const firstSentence=description.match(/^(.+?[.!?])(?:\s|$)/)?.[1];
  const summary=firstSentence?.length>=30&&firstSentence.length<=100?firstSentence:description.length<=100?description:description.slice(0,98).replace(/\s+\S*$/,'')+'…';
  return {name:clean(meta.get('og:site_name')||meta.get('application-name')||meta.get('og:title')||html.match(/<title\b[^>]*>([\s\S]*?)<\/title>/i)?.[1],60),description:summary};
}
export async function enrichSubmission(input,{readHtml=readPublicHtml}={}) {
  const site=validateSubmission(input);const generated=[];let metadata={};
  if(!site.name||!site.description){try{metadata=extractMetadata(await readHtml(site.url));}catch{/* A failed metadata fetch never prevents a suggestion. */}}
  const host=new URL(site.url).hostname.replace(/^www\./,'');
  if(!site.name){site.name=metadata.name||host.slice(0,60);generated.push('name');}
  if(!site.description){site.description=metadata.description||clean(`A website at ${host}.`,100);generated.push('description');}
  return {site,generated};
}
