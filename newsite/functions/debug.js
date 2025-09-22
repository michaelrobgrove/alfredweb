export async function onRequest(context) {
  try {
    const posts = await context.env.BLOG_KV.get('posts');
    return new Response(`KV Data: ${posts || 'null'}`, {
      headers: { 'Content-Type': 'text/plain' }
    });
  } catch (error) {
    return new Response(`Error: ${error.message}`, { status: 500 });
  }
}