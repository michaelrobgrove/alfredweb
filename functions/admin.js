export async function onRequest(context) {
  const { env, request } = context;

  // This function will now handle both GET and POST requests
  // For a simple admin panel, we can fetch data on every request
  
  try {
    const postsJson = await env.BLOG_KV.get('posts');
    const grantAppsJson = await env.BLOG_KV.get('grant_applications');
    const postsData = JSON.parse(postsJson || '{"posts":[]}');
    let grantApplicationsData = JSON.parse(grantAppsJson || '[]');

    // Ensure grantApplicationsData is always an array
    if (!Array.isArray(grantApplicationsData)) {
      grantApplicationsData = [];
    }

    if (request.method === 'POST') {
      const formData = await request.formData();
      const username = formData.get('username');
      const password = formData.get('password');
      
      if (username !== env.ADMIN_USERNAME || password !== env.ADMIN_PASSWORD) {
        return new Response(loginForm('Invalid credentials'), { headers: { 'Content-Type': 'text/html' } });
      }

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
      
      // After a POST action, render the full dashboard
      return new Response(adminDashboard(postsData.posts, grantApplicationsData, message, username, password), {
        headers: { 'Content-Type': 'text/html' }
      });
    }

    // For GET requests, just show the login form
    return new Response(loginForm(), { headers: { 'Content-Type': 'text/html' } });

  } catch (error) {
    return new Response(`Error: ${error.message}`, { status: 500 });
  }
}


function loginForm(error = '') {
  // This function can remain mostly the same, but it's good practice
  // to link to the external stylesheet instead of having styles here.
  return `<!DOCTYPE html>...`; // Keeping this collapsed for brevity
}


function adminDashboard(posts, grantApplications, message = '', username, password) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Admin Dashboard</title>
  <link rel="stylesheet" href="/styles.css">
  <style>
    /* Tab specific styles */
    .tabs {
      display: flex;
      border-bottom: 2px solid var(--gold);
      margin-bottom: 20px;
    }
    .tab-link {
      padding: 10px 20px;
      cursor: pointer;
      background: none;
      border: none;
      color: white;
      font-family: 'Cinzel', serif;
      font-size: 18px;
      opacity: 0.7;
      transition: all 0.3s ease;
    }
    .tab-link.active, .tab-link:hover {
      opacity: 1;
      background-color: rgba(205, 166, 24, 0.1);
      border-bottom: 2px solid var(--gold);
      margin-bottom: -2px;
    }
    .tab-content {
      display: none;
    }
    .tab-content.active {
      display: block;
    }
  </style>
</head>
<body>
  <div class="background"> ... </div>
  <nav> ... </nav>

  <div class="container">
    <div class="hero">
      <h1>Admin Dashboard</h1>
      ${message ? `<p style="color: #4CAF50; ...">${message}</p>` : ''}
    </div>

    <div class="tabs">
      <button class="tab-link active" onclick="openTab(event, 'posts')">Blog Posts (${posts.length})</button>
      <button class="tab-link" onclick="openTab(event, 'applications')">Grant Applications (${grantApplications.length})</button>
    </div>

    <div id="posts" class="tab-content active">
      <div style="margin-bottom: 30px; text-align: center;">
        <form method="POST" ...>
          ...
          <button type="submit" class="cta-button" style="background-color: #dc3545;">Clear All Posts</button>
        </form>
        <a href="/test-blog" class="cta-button" target="_blank">Create New Post</a>
      </div>
      ${posts.length === 0 ? '<div class="service-card"><p>No blog posts yet.</p></div>' : ''}
      ${posts.map((post, i) => `
        <div class="service-card" style="margin-bottom: 20px; text-align: left;">
          ... </div>
      `).join('')}
    </div>

    <div id="applications" class="tab-content">
      ${grantApplications.length === 0 ? '<div class="service-card"><p>No grant applications yet.</p></div>' : ''}
      ${grantApplications.map((app, i) => `
        <div class="service-card" style="margin-bottom: 20px; text-align: left;">
          <h3 style="color: var(--gold);">${app.organization}</h3>
          <p><strong>Contact:</strong> ${app.name} | <strong>Email:</strong> ${app.email}</p>
          <p><strong>Phone:</strong> ${app.phone}</p>
          <p><strong>Address:</strong> ${app.address}</p>
          <p><strong>Plan Choice:</strong> ${app.['preferred-plan']}</p>
          <p><strong>Nonprofit Status:</strong> ${app.['nonprofit-status']}</p>
          <p style="white-space: pre-wrap;"><strong>Mission:</strong> ${app.mission}</p>
          ${app.details ? `<p style="white-space: pre-wrap;"><strong>Details:</strong> ${app.details}</p>` : ''}
          <p><strong>Submitted:</strong> ${new Date(app.submittedAt).toLocaleString()}</p>
          <div style="margin-top: 15px;">
            <button onclick='downloadApplication(${JSON.stringify(app)}, "${app.organization.replace(/[^a-zA-Z0-9]/g, '_')}")' class="cta-button">Download</button>
            <form method="POST" style="display: inline;" onsubmit="return confirm('Delete this application?');">
              <input type="hidden" name="action" value="delete_grant">
              <input type="hidden" name="entryId" value="${i}">
              <input type="hidden" name="username" value="${username}">
              <input type="hidden" name="password" value="${password}">
              <button type="submit" style="background: #dc3545; color: white; ...">Delete</button>
            </form>
          </div>
        </div>
      `).join('')}
    </div>
  </div>

  <script>
    function openTab(evt, tabName) {
      let i, tabcontent, tablinks;
      tabcontent = document.getElementsByClassName("tab-content");
      for (i = 0; i < tabcontent.length; i++) {
        tabcontent[i].style.display = "none";
      }
      tablinks = document.getElementsByClassName("tab-link");
      for (i = 0; i < tablinks.length; i++) {
        tablinks[i].className = tablinks[i].className.replace(" active", "");
      }
      document.getElementById(tabName).style.display = "block";
      evt.currentTarget.className += " active";
    }
    document.getElementById('posts').style.display = 'block'; // Show first tab by default

    function downloadApplication(appData, orgName) {
      const htmlContent = \`
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <title>Grant Application: \${orgName}</title>
          <style>
            body { font-family: sans-serif; line-height: 1.6; margin: 20px; }
            h1 { color: #333; }
            strong { display: inline-block; width: 150px; }
            p { border-bottom: 1px solid #eee; padding-bottom: 10px; }
            pre { white-space: pre-wrap; background: #f4f4f4; padding: 10px; border-radius: 5px; }
          </style>
        </head>
        <body>
          <h1>Grant Application: \${appData.organization}</h1>
          <p><strong>Submitted At:</strong> \${new Date(appData.submittedAt).toLocaleString()}</p>
          <p><strong>Contact Name:</strong> \${appData.name}</p>
          <p><strong>Organization:</strong> \${appData.organization}</p>
          <p><strong>Address:</strong> \${appData.address}</p>
          <p><strong>Phone:</strong> \${appData.phone}</p>
          <p><strong>Email:</strong> \${appData.email}</p>
          <p><strong>Preferred Plan:</strong> \${appData['preferred-plan']}</p>
          <p><strong>Nonprofit Status:</strong> \${appData['nonprofit-status']}</p>
          <h3>Mission Statement</h3>
          <pre>\${appData.mission}</pre>
          <h3>Additional Details</h3>
          <pre>\${appData.details || 'N/A'}</pre>
        </body>
        </html>
      \`;
      const blob = new Blob([htmlContent], { type: 'text/html' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = \`grant_application_\${orgName}.html\`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  </script>
</body>
</html>`;
}