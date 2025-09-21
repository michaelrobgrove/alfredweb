export async function onRequest(context) {
  await context.env.BLOG_KV.put('posts', '{"posts":[]}');
  return new Response('All posts cleared!');
}export async function onRequest() {
  return Response.redirect('/admin', 302);
}