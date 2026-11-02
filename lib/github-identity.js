const ISSUER = 'https://token.actions.githubusercontent.com';
const AUDIENCE = 'hn-atlas-review';
function decode(part) { return Uint8Array.from(atob(part.replace(/-/g,'+').replace(/_/g,'/').padEnd(Math.ceil(part.length/4)*4,'=')), char => char.charCodeAt(0)); }
export async function verifyGithubIdentity(token, {fetcher=fetch, now=Date.now()} = {}) {
  if (typeof token !== 'string' || token.length > 12000) throw new Error('Unauthorized');
  const parts = token.split('.'); if(parts.length !== 3) throw new Error('Unauthorized');
  const header = JSON.parse(new TextDecoder().decode(decode(parts[0])));
  const claims = JSON.parse(new TextDecoder().decode(decode(parts[1])));
  const seconds = now/1000;
  if (header.alg !== 'RS256' || typeof header.kid !== 'string' || claims.iss !== ISSUER || claims.aud !== AUDIENCE || !Number.isFinite(claims.exp) || claims.exp <= seconds || !Number.isFinite(claims.nbf) || claims.nbf > seconds+30 || claims.repository_id !== '1443332515' || !['wa008/awesome-hn','wa008/hn-atlas'].includes(claims.repository) || claims.ref !== 'refs/heads/main' || !['wa008/awesome-hn/.github/workflows/submissions.yml@refs/heads/main','wa008/hn-atlas/.github/workflows/submissions.yml@refs/heads/main'].includes(claims.workflow_ref) || !['push','schedule','workflow_dispatch','issues'].includes(claims.event_name)) throw new Error('Unauthorized');
  const response = await fetcher(`${ISSUER}/.well-known/jwks`, {signal:AbortSignal.timeout(10000)});
  if (!response.ok) throw new Error('Identity service unavailable');
  const {keys} = await response.json(); const jwk = keys?.find(key => key.kid === header.kid && key.kty === 'RSA' && key.use === 'sig');
  if(!jwk) throw new Error('Unauthorized');
  const key = await crypto.subtle.importKey('jwk',jwk,{name:'RSASSA-PKCS1-v1_5',hash:'SHA-256'},false,['verify']);
  if(!await crypto.subtle.verify('RSASSA-PKCS1-v1_5',key,decode(parts[2]),new TextEncoder().encode(`${parts[0]}.${parts[1]}`))) throw new Error('Unauthorized');
  return claims;
}
