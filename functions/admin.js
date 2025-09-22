// This function handles rendering the login form
function loginForm(error = '') {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Admin Login</title>
  <link rel="stylesheet" href="/styles.css">
</head>
<body>
  <div class="background">
    <div class="background-image"></div>
    <div class="animated-gradient"></div>
    <div class="dots"></div>
  </div>
  <div class="container">
    <div class="form-section">
      <h2>Admin Login</h2>
      ${error ? `<p style="color: #ff6b6b; ...">${error}</p>` : ''}
      <form method="POST">
        <div class="form-group">
          <label for="username">Username:</label>
          <input type="text" id="username" name="username" required class="form-control">
        </div>
        <div class="form-group">
          <label for="password">Password:</label>
          <input type="password" id="password" name="password" required class="form-control">
        </div>
        <button type="submit" class="submit-button">Login</button>
      </form>
    </div>
  </div>
</body>
</html>`;
}

// This function handles rendering the main dashboard
function adminDashboard(posts, grantApplications, message = '', username, password) {
  // This is the large HTML block from the previous version.
  // No changes are needed inside this function.
  return `<!DOCTYPE html>...`; // Collapsed for brevity
}

// Main handler for all requests to /admin
export async function onRequest(context) {
  const { env, request } = context;

  try {
    // If the request is a POST, it's a login attempt or an action
    if (request.method === 'POST') {
      const formData = await request.formData();
      const username = formData.get('username');
      const password = formData.get('password');

      // 1. Check Credentials
      if (username !== env.ADMIN_USERNAME || password !== env.ADMIN_PASSWORD) {
        return new Response(loginForm('Invalid credentials'), { headers: { 'Content-Type': 'text/html' } });
      }

      // 2. Credentials are valid, so fetch all data
      const postsJson = await env.BLOG_KV.get('posts');
      const grantAppsJson = await env.BLOG_KV.get('grant_applications');
      const postsData = JSON.parse(postsJson || '{"posts":[]}');
      let grantApplicationsData = JSON.parse(grantAppsJson || '[]');
      if (!Array.isArray(grantApplicationsData)) {
          grantApplicationsData = [];
      }

      const action = formData.get('action');
      const entryId = formData.get('entryId');
      let message = '';

      // 3. Handle any actions (delete, clear, etc.)
      if (action === 'delete_post' && entryId !== null) {
        postsData.posts.splice(parseInt(entryId), 1);
        await env.BLOG_KV.put('posts', JSON.stringify(postsData));
        message = 'Post deleted successfully.';
      } else if (action === 'clear_posts') {
        await env.BLOG_KV.put('posts', '{"posts":[]}');
        postsData.posts = [];
        message = 'All posts cleared.';
      } else if (action === 'delete_grant' && entryId !== null) {
        grantApplicationsData.splice(parseInt(entryId), 1);
        await env.BLOG_KV.put('grant_applications', JSON.stringify(grantApplicationsData));
        message = 'Grant application deleted successfully.';
      }
      
      // 4. Render the dashboard
      return new Response(adminDashboard(postsData.posts, grantApplicationsData, message, username, password), {
        headers: { 'Content-Type': 'text/html' }
      });
    }

    // If the request is a GET, just show the login form
    return new Response(loginForm(), { headers: { 'Content-Type': 'text/html' } });

  } catch (error) {
    return new Response(`Error: ${error.message}`, { status: 500 });
  }
}