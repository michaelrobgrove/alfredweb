export async function onRequest(context) {
  const { env, request } = context;
  const url = new URL(request.url);
  
  if (request.method === 'POST') {
    // Handle login
    const formData = await request.formData();
    const username = formData.get('username');
    const password = formData.get('password');
    const action = formData.get('action');
    const postId = formData.get('postId');
    
    // Check credentials
    if (username !== env.ADMIN_USERNAME || password !== env.ADMIN_PASSWORD) {
      return new Response(loginForm('Invalid credentials'), { 
        headers: { 'Content-Type': 'text/html' } 
      });
    }
    
    try {
      const posts = await env.BLOG_KV.get('posts');
      const postsData = JSON.parse(posts || '{"posts":[]}');
      
      if (action === 'delete' && postId !== null) {
        postsData.posts.splice(parseInt(postId), 1);
        await env.BLOG_KV.put('posts', JSON.stringify(postsData));
        return new Response(adminDashboard(postsData.posts, 'Post deleted successfully'), { 
          headers: { 'Content-Type': 'text/html' } 
        });
      }
      
      if (action === 'clear') {
        await env.BLOG_KV.put('posts', '{"posts":[]}');
        return new Response(adminDashboard([], 'All posts cleared'), { 
          headers: { 'Content-Type': 'text/html' } 
        });
      }
      
      return new Response(adminDashboard(postsData.posts), { 
        headers: { 'Content-Type': 'text/html' } 
      });
      
    } catch (error) {
      return new Response(`Error: ${error.message}`, { status: 500 });
    }
  }
  
  // Show login form
  return new Response(loginForm(), { 
    headers: { 'Content-Type': 'text/html' } 
  });
}

function loginForm(error = '') {
  return `<!DOCTYPE html>
<html>
<head><title>Blog Admin</title></head>
<body style="font-family: Arial; max-width: 400px; margin: 100px auto; padding: 20px;">
  <h2>Blog Admin Login</h2>
  ${error ? `<p style="color: red;">${error}</p>` : ''}
  <form method="POST">
    <div style="margin-bottom: 15px;">
      <label>Username:</label><br>
      <input type="text" name="username" required style="width: 100%; padding: 8px;">
    </div>
    <div style="margin-bottom: 15px;">
      <label>Password:</label><br>
      <input type="password" name="password" required style="width: 100%; padding: 8px;">
    </div>
    <button type="submit" style="padding: 10px 20px;">Login</button>
  </form>
</body>
</html>`;
}

function adminDashboard(posts, message = '') {
  return `<!DOCTYPE html>
<html>
<head><title>Blog Admin Dashboard</title></head>
<body style="font-family: Arial; max-width: 800px; margin: 20px auto; padding: 20px;">
  <h1>Blog Admin Dashboard</h1>
  ${message ? `<p style="color: green; background: #e8f5e8; padding: 10px;">${message}</p>` : ''}
  
  <div style="margin-bottom: 20px;">
    <form method="POST" style="display: inline;" onsubmit="return confirm('Clear ALL posts?');">
      <input type="hidden" name="action" value="clear">
      <button type="submit" style="padding: 8px 15px; background: red; color: white;">Clear All Posts</button>
    </form>
  </div>
  
  <h2>Blog Posts (${posts.length})</h2>
  ${posts.map((post, i) => `
    <div style="border: 1px solid #ccc; margin: 10px 0; padding: 15px;">
      <h3>${post.title}</h3>
      <p><strong>Date:</strong> ${post.date} | <strong>Slug:</strong> ${post.slug}</p>
      <p>${post.excerpt}</p>
      <form method="POST" style="margin-top: 10px;" onsubmit="return confirm('Delete this post?');">
        <input type="hidden" name="action" value="delete">
        <input type="hidden" name="postId" value="${i}">
        <button type="submit" style="padding: 5px 10px; background: #dc3545; color: white;">Delete</button>
      </form>
      <a href="/blog/${post.slug}" target="_blank" style="margin-left: 10px;">View Post</a>
    </div>
  `).join('')}
</body>
</html>`;
}