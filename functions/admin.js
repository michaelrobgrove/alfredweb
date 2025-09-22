export async function onRequest(context) {
  const { env, request } = context;

  if (request.method === 'POST') {
    const formData = await request.formData();
    const username = formData.get('username');
    const password = formData.get('password');
    const action = formData.get('action');
    const entryId = formData.get('entryId'); // Use a generic ID

    if (username !== env.ADMIN_USERNAME || password !== env.ADMIN_PASSWORD) {
      return new Response(loginForm('Invalid credentials'), { headers: { 'Content-Type': 'text/html' } });
    }

    try {
      // Always fetch both posts and applications
      const postsJson = await env.BLOG_KV.get('posts');
      const grantAppsJson = await env.BLOG_KV.get('grant_applications');
      const postsData = JSON.parse(postsJson || '{"posts":[]}');
      const grantApplicationsData = JSON.parse(grantAppsJson || '[]'); // Default to empty array

      let message = '';

      if (action === 'delete_post' && entryId !== null) {
        postsData.posts.splice(parseInt(entryId), 1);
        await env.BLOG_KV.put('posts', JSON.stringify(postsData));
        message = 'Post deleted successfully.';
      } else if (action === 'clear_posts') {
        await env.BLOG_KV.put('posts', '{"posts":[]}');
        postsData.posts = []; // Clear local data too
        message = 'All posts cleared.';
      } else if (action === 'delete_grant' && entryId !== null) {
        grantApplicationsData.splice(parseInt(entryId), 1);
        await env.BLOG_KV.put('grant_applications', JSON.stringify(grantApplicationsData));
        message = 'Grant application deleted successfully.';
      }

      return new Response(adminDashboard(postsData.posts, grantApplicationsData, message, username, password), {
        headers: { 'Content-Type': 'text/html' }
      });

    } catch (error) {
      return new Response(`Error: ${error.message}`, { status: 500 });
    }
  }

  // GET request: Fetch everything and show the dashboard or login
  // This part is for when you just load the /admin page
  const postsJson = await env.BLOG_KV.get('posts');
  const grantAppsJson = await env.BLOG_KV.get('grant_applications');
  const postsData = JSON.parse(postsJson || '{"posts":[]}');
  const grantApplicationsData = JSON.parse(grantAppsJson || '[]');

  // For simplicity, we'll just show the login form on GET. 
  // A real admin would handle sessions, but this works for a simple setup.
  return new Response(loginForm(), { headers: { 'Content-Type': 'text/html' } });
}


function loginForm(error = '') {
  // Login form HTML remains the same...
  return `<!DOCTYPE html> ...`; 
}

function adminDashboard(posts, grantApplications, message = '', username, password) {
  // Check if grantApplications is actually an array before mapping
  const grantApplicationsList = Array.isArray(grantApplications) ? grantApplications : [];

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Admin Dashboard</title>
  <link rel="stylesheet" href="/styles.css">
</head>
<body>
  <div class="container">
    <h1>Admin Dashboard</h1>
    ${message ? `<p style="color: #4CAF50;">${message}</p>` : ''}
    
    <h2>Blog Posts (${posts.length})</h2>
    <form method="POST" onsubmit="return confirm('Clear ALL posts?');">
      <input type="hidden" name="action" value="clear_posts">
      <input type="hidden" name="username" value="${username}">
      <input type="hidden" name="password" value="${password}">
      <button type="submit">Clear All Posts</button>
    </form>
    <a href="/test-blog" target="_blank">Create New Post</a>
    
    ${posts.map((post, i) => `
      <div>
        <h3>${post.title}</h3>
        <p>${post.excerpt}</p>
        <form method="POST" onsubmit="return confirm('Delete this post?');">
          <input type="hidden" name="action" value="delete_post">
          <input type="hidden" name="entryId" value="${i}">
          <input type="hidden" name="username" value="${username}">
          <input type="hidden" name="password" value="${password}">
          <button type="submit">Delete</button>
        </form>
      </div>
    `).join('')}

    <h2>Grant Applications (${grantApplicationsList.length})</h2>
    ${grantApplicationsList.length === 0 ? '<p>No grant applications yet.</p>' : ''}
    ${grantApplicationsList.map((app, i) => `
      <div style="border: 1px solid #ccc; padding: 10px; margin-bottom: 10px;">
        <h3>${app.organization}</h3>
        <p><strong>Contact:</strong> ${app.name} (${app.email})</p>
        <p><strong>Submitted:</strong> ${new Date(app.submittedAt).toLocaleString()}</p>
        <p><strong>Mission:</strong> ${app.mission}</p>
        <form method="POST" onsubmit="return confirm('Delete this application?');">
          <input type="hidden" name="action" value="delete_grant">
          <input type="hidden" name="entryId" value="${i}">
          <input type="hidden" name="username" value="${username}">
          <input type="hidden" name="password" value="${password}">
          <button type="submit">Delete Application</button>
        </form>
      </div>
    `).join('')}
  </div>
</body>
</html>`;
}