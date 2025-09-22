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
      ${error ? `<p style="color: #ff6b6b; background: rgba(255,107,107,0.1); padding: 10px; border-radius: 5px; margin-bottom: 15px;">${error}</p>` : ''}
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
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Admin Dashboard</title>
  <link rel="stylesheet" href="/styles.css">
</head>
<body>
  <div class="background">
    <div class="background-image"></div>
    <div class="animated-gradient"></div>
    <div class="dots" id="dots-container"></div>
  </div>
  <nav>
    <div class="nav-container">
      <a href="/" class="nav-item">Home</a>
      <a href="/blog/" class="nav-item">Blog</a>
      <a href="/admin" class="nav-item active">Admin</a>
    </div>
  </nav>

  <div class="container">
    <div class="hero">
      <h1>Admin Dashboard</h1>
      ${message ? `<p style="color: #4CAF50; background: rgba(76,175,80,0.1); padding: 15px; border-radius: 10px; margin: 20px 0;">${message}</p>` : ''}
    </div>

    <div class="tabs">
      <button class="tab-link active" onclick="openTab(event, 'posts')">Blog Posts (${posts.length})</button>
      <button class="tab-link" onclick="openTab(event, 'applications')">Grant Applications (${grantApplications.length})</button>
    </div>

    <div id="posts" class="tab-content active">
      <div class="admin-actions">
        <form method="POST" style="display: inline;" onsubmit="return confirm('Clear ALL posts? This cannot be undone!');">
          <input type="hidden" name="action" value="clear_posts">
          <input type="hidden" name="username" value="${username}">
          <input type="hidden" name="password" value="${password}">
          <button type="submit" class="cta-button" style="background-color: #dc3545;">Clear All Posts</button>
        </form>
        <a href="/test-blog" class="cta-button" target="_blank">Create New Post</a>
      </div>
      ${posts.length === 0 ? '<div class="service-card" style="text-align:center;"><p>No blog posts yet.</p></div>' : ''}
      ${posts.map((post, i) => `
        <div class="service-card" style="margin-bottom: 20px; text-align: left;">
          <h3 style="color: var(--gold);">${post.title}</h3>
          <p><strong>Date:</strong> ${post.date} | <strong>Slug:</strong> ${post.slug}</p>
          <p style="margin: 10px 0; opacity: 0.8;">${post.excerpt}</p>
          <div style="margin-top: 15px;">
            <form method="POST" style="display: inline; margin-right: 10px;" onsubmit="return confirm('Delete this post?');">
              <input type="hidden" name="action" value="delete_post">
              <input type="hidden" name="entryId" value="${i}">
              <input type="hidden" name="username" value="${username}">
              <input type="hidden" name="password" value="${password}">
              <button type="submit" class="cta-button" style="background-color: #c82333; padding: 8px 15px;">Delete</button>
            </form>
            <a href="/blog/${post.slug}" target="_blank" class="cta-button" style="padding: 8px 15px;">View Post</a>
          </div>
        </div>
      `).join('')}
    </div>

    <div id="applications" class="tab-content">
      ${grantApplications.length === 0 ? '<div class="service-card" style="text-align:center;"><p>No grant applications yet.</p></div>' : ''}
      ${grantApplications.map((app, i) => `
        <div class="service-card" style="margin-bottom: 20px; text-align: left; line-height: 1.6;">
          <h3 style="color: var(--gold);">${app.organization}</h3>
          <p><strong>Contact:</strong> ${app.name} | <strong>Email:</strong> ${app.email}</p>
          <p><strong>Phone:</strong> ${app.phone}</p>
          <p><strong>Address:</strong> ${app.address}</p>
          <p><strong>Plan Choice:</strong> ${app['preferred-plan']}</p>
          <p><strong>Nonprofit Status:</strong> ${app['nonprofit-status']}</p>
          <p style="white-space: pre-wrap;"><strong>Mission:</strong> ${app.mission}</p>
          ${app.details ? `<p style="white-space: pre-wrap;"><strong>Details:</strong> ${app.details}</p>` : ''}
          <p><strong>Submitted:</strong> ${new Date(app.submittedAt).toLocaleString()}</p>
          <div style="margin-top: 15px;">
            <button onclick='downloadApplication(${JSON.stringify(app)}, "${app.organization.replace(/[^a-zA-Z0-9]/g, '_')}")' class="cta-button" style="margin-right: 10px; padding: 8px 15px;">Download</button>
            <form method="POST" style="display: inline;" onsubmit="return confirm('Delete this application?');">
              <input type="hidden" name="action" value="delete_grant">
              <input type="hidden" name="entryId" value="${i}">
              <input type="hidden" name="username" value="${username}">
              <input type="hidden" name="password" value="${password}">
              <button type="submit" class="cta-button" style="background: #c82333; padding: 8px 15px;">Delete</button>
            </form>
          </div>
        </div>
      `).join('')}
    </div>
  </div>

  <script>
    function openTab(evt, tabName) {
      const tabcontent = document.getElementsByClassName("tab-content");
      for (let i = 0; i < tabcontent.length; i++) { tabcontent[i].style.display = "none"; }
      const tablinks = document.getElementsByClassName("tab-link");
      for (let i = 0; i < tablinks.length; i++) { tablinks[i].className = tablinks[i].className.replace(" active", ""); }
      document.getElementById(tabName).style.display = "block";
      evt.currentTarget.className += " active";
    }

    function downloadApplication(appData, orgName) {
      const htmlContent = \`
        <!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><title>Grant Application: \${orgName}</title>
        <style>body{font-family:sans-serif;line-height:1.6;margin:40px}h1{color:#333}h3{margin-top:30px;border-bottom:1px solid #ccc;padding-bottom:5px}p{border-bottom:1px solid #eee;padding:10px 0;margin:0}strong{display:inline-block;width:150px;color:#555}pre{white-space:pre-wrap;background:#f4f4f4;padding:15px;border-radius:5px;font-family:inherit;font-size:1em}</style>
        </head><body><h1>Grant Application: \${appData.organization}</h1>
        <p><strong>Submitted At:</strong> \${new Date(appData.submittedAt).toLocaleString()}</p><p><strong>Contact Name:</strong> \${appData.name}</p>
        <p><strong>Organization:</strong> \${appData.organization}</p><p><strong>Address:</strong> \${appData.address}</p>
        <p><strong>Phone:</strong> \${appData.phone}</p><p><strong>Email:</strong> \${appData.email}</p>
        <p><strong>Preferred Plan:</strong> \${appData['preferred-plan']}</p><p><strong>Nonprofit Status:</strong> \${appData['nonprofit-status']}</p>
        <h3>Mission Statement</h3><pre>\${appData.mission}</pre><h3>Additional Details</h3><pre>\${appData.details || 'N/A'}</pre>
        </body></html>\`;
      const blob = new Blob([htmlContent], { type: 'text/html' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = \`grant_application_\${orgName}.html\`;
      document.body.appendChild(a);
a.click();
      document.body.removeChild(a);
    }
    
    document.addEventListener('DOMContentLoaded', () => {
      // Show first tab by default
      const firstTab = document.querySelector('.tab-content');
      if (firstTab) {
        firstTab.style.display = 'block';
      }
      
      // Dots background script
      const dotsContainer = document.getElementById('dots-container');
      if (dotsContainer) {
        for (let i = 0; i < 50; i++) {
          const dot = document.createElement('div');
          dot.classList.add('dot');
          dot.style.left = \`\${Math.random() * 100}%\`;
          dot.style.top = \`\${Math.random() * 100}%\`;
          const size = Math.random() * 3 + 1;
          dot.style.width = \`\${size}px\`;
          dot.style.height = \`\${size}px\`;
          dot.style.backgroundColor = 'rgba(205, 166, 24, 0.7)';
          dotsContainer.appendChild(dot);
        }
      }
    });
  </script>
</body>
</html>`;
}

// Main handler for all requests to /admin
export async function onRequest(context) {
  const { env, request } = context;

  try {
    if (request.method === 'POST') {
      const formData = await request.formData();
      const username = formData.get('username');
      const password = formData.get('password');

      if (username !== env.ADMIN_USERNAME || password !== env.ADMIN_PASSWORD) {
        return new Response(loginForm('Invalid credentials'), { headers: { 'Content-Type': 'text/html' } });
      }

      const postsJson = await env.BLOG_KV.get('posts');
      const grantAppsJson = await env.BLOG_KV.get('grant_applications');
      const postsData = JSON.parse(postsJson || '{"posts":[]}');
      let grantApplicationsData = JSON.parse(grantAppsJson || '[]');
      if (!Array.isArray(grantApplicationsData)) { grantApplicationsData = []; }

      const action = formData.get('action');
      const entryId = formData.get('entryId');
      let message = '';

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
      
      return new Response(adminDashboard(postsData.posts, grantApplicationsData, message, username, password), {
        headers: { 'Content-Type': 'text/html' }
      });
    }

    return new Response(loginForm(), { headers: { 'Content-Type': 'text/html' } });

  } catch (error) {
    return new Response(`Error: ${error.message}`, { status: 500 });
  }
}