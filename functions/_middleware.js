export async function onRequest(context) {
  const url=new URL(context.request.url);
  if(url.hostname==='awesome-hn.pages.dev') {url.hostname='hn-atlas.pages.dev';return Response.redirect(url.href,308);}
  return context.next();
}
