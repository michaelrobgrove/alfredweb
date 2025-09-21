export async function onRequest(context) {
  const { env, request } = context;
  const url = new URL(request.url);
  const action = url.searchParams.get('action');
  const password = url.searchParams.get('password');
  const postId = url.searchParams.get('id');
  
  // Simple password protection
  if (password !== env.ADMIN_PASSWORD) {
    return new Response('Unauthorized', { status: 401 });
  }
  
  try {
    const posts = await env.BLOG_KV.get('posts');
    const postsData = JSON.parse(posts || '{"posts":[]}');
    
    if (action === 'list') {
      // Show all posts with delete links
      const html = `<html><body><h1>Blog Admin</h1>
        ${postsData.posts.map((p, i) => `
          <div style="border:1px solid #ccc; margin:10px; padding:10px;">
            <h3>${p.title}</h3>
            <p>Date: ${p.date} | Slug: ${p.slug}</p>
            <p>${p.excerpt}</p>
            <a href="/admin?action=delete&id=${i}&password=${password}">DELETE</a>
          </div>
        `).join('')}
      </body></html>`;
      return new Response(html, { headers: { 'Content-Type': 'text/html' } });
    }
    
    if (action === 'delete' && postId !== null) {
      // Delete specific post
      postsData.posts.splice(parseInt(postId), 1);
      await env.BLOG_KV.put('posts', JSON.stringify(postsData));
      return new Response(`Post deleted. <a href="/admin?action=list&password=${password}">Back to list</a>`, 
        { headers: { 'Content-Type': 'text/html' } });
    }
    
    return new Response('Invalid action');
    
  } catch (error) {
    return new Response(`Error: ${error.message}`, { status: 500 });
  }
}