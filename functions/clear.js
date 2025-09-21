export async function onRequest(context) {
  await context.env.BLOG_KV.put('posts', '{"posts":[]}');
  return new Response('All posts cleared!');
}