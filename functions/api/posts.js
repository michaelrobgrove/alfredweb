export async function onRequest(context) {
  const posts = await context.env.BLOG_KV.get('posts');
  return new Response(posts || '{"posts":[]}', {
    headers: { 'Content-Type': 'application/json' }
  });
}