export async function onRequest(context) {
  const { env, request } = context;
  
  if (request.method === 'POST') {
    // Handle login and actions
    const formData = await request.formData();
    const username = formData.get('username');
    const password = formData.get('password');
    const action = formData.get('action');
    const postId = formData.get('postId');
    
    // Check credentials for every action
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
        return new Response(adminDashboard(postsData.posts, 'Post deleted successfully', username, password), { 
          headers: { 'Content-Type': 'text/html' } 
        });
      }
      
      if (action === 'clear') {
        await env.BLOG_KV.put('posts', '{"posts":[]}');
        return new Response(adminDashboard([], 'All posts cleared', username, password), { 
          headers: { 'Content-Type': 'text/html' } 
        });
      }
      
      return new Response(adminDashboard(postsData.posts, '', username, password), { 
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
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Blog Admin - Alfred Web Design & Shirts</title>
  <link href="https://fonts.googleapis.com/css2?family=Lato:wght@300;400;600;700&family=Cinzel:wght@400;500;600&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="/styles.css">
</head>
<body>
  <div class="background">
    <div class="background-image"></div>
    <div class="animated-gradient"></div>
    <div class="dots"></div>
  </div>

  <nav>
    <div class="nav-container">
      <a href="/" class="nav-item">Home</a>
      <a href="/blog/" class="nav-item">Blog</a>
      <a href="/admin" class="nav-item active">Admin</a>
    </div>
  </nav>

  <div class="container">
    <div class="form-section">
      <h2>Blog Admin Login</h2>
      ${error ? `<p style="color: #ff6b6b; background: rgba(255,107,107,0.1); padding: 10px; border-radius: 5px;">${error}</p>` : ''}
      <form method="POST">
        <div class="form-group">
          <label>Username:</label>
          <input type="text" name="username" required class="form-control">
        </div>
        <div class="form-group">
          <label>Password:</label>
          <input type="password" name="password" required class="form-control">
        </div>
        <button type="submit" class="submit-button">Login</button>
      </form>
    </div>
  </div>

  <script>
    function createDots() {
      const dotsContainer = document.querySelector('.dots');
      for (let i = 0; i < 50; i++) {
        const dot = document.createElement('div');
        dot.className = 'dot';
        dot.style.left = Math.random() * 100 + '%';
        dot.style.top = Math.random() * 100 + '%';
        dot.style.width = Math.random() * 4 + 2 + 'px';
        dot.style.height = dot.style.width;
        dot.style.backgroundColor = 'rgba(205, 166, 24, 0.7)';
        dotsContainer.appendChild(dot);
      }
    }
    createDots();
  </script>
</body>
</html>`;
}

function adminDashboard(posts, grantApplications = [], message = '', username, password) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Blog Admin Dashboard - Alfred Web Design & Shirts</title>
  <link href="https://fonts.googleapis.com/css2?family=Lato:wght@300;400;600;700&family=Cinzel:wght@400;500;600&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="/styles.css">
</head>
<body>
  <div class="background">
    <div class="background-image"></div>
    <div class="animated-gradient"></div>
    <div class="dots"></div>
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
      
      <div style="margin-bottom: 30px;">
        <form method="POST" style="display: inline; margin-right: 15px;" onsubmit="return confirm('Clear ALL posts? This cannot be undone!');">
          <input type="hidden" name="action" value="clear">
          <input type="hidden" name="username" value="${username}">
          <input type="hidden" name="password" value="${password}">
          <button type="submit" class="cta-button" style="background-color: #dc3545;">Clear All Posts</button>
        </form>
        <a href="/test-blog" class="cta-button" target="_blank">Create New Post</a>
      </div>
      
      <h2 style="color: var(--gold); margin-bottom: 20px;">Blog Posts (${posts.length})</h2>
    </div>
    
    ${posts.map((post, i) => `
      <div class="service-card" style="margin-bottom: 20px; text-align: left;">
        <h3 style="color: var(--gold);">${post.title}</h3>
        <p><strong>Date:</strong> ${post.date} | <strong>Slug:</strong> ${post.slug}</p>
        <p style="margin: 10px 0;">${post.excerpt}</p>
        <div style="margin-top: 15px;">
          <form method="POST" style="display: inline; margin-right: 15px;" onsubmit="return confirm('Delete this post? This cannot be undone!');">
            <input type="hidden" name="action" value="delete">
            <input type="hidden" name="postId" value="${i}">
            <input type="hidden" name="username" value="${username}">
            <input type="hidden" name="password" value="${password}">
            <button type="submit" style="background: #dc3545; color: white; padding: 8px 15px; border: none; border-radius: 5px; cursor: pointer;">Delete</button>
          </form>
          <a href="/blog/${post.slug}" target="_blank" class="cta-button" style="text-decoration: none; display: inline-block; padding: 8px 15px;">View Post</a>
        </div>
      </div>
    `).join('')}

    <div class="hero" style="margin-top: 40px;">
      <h2 style="color: var(--gold); margin-bottom: 20px;">Grant Applications (${grantApplications.length})</h2>
    </div>

    ${grantApplications.map((app, i) => `
      <div class="service-card" style="margin-bottom: 20px; text-align: left;">
        <h3 style="color: var(--gold);">${app.data.organization}</h3>
        <p><strong>Contact:</strong> ${app.data.name} | <strong>Email:</strong> ${app.data.email}</p>
        <p><strong>Phone:</strong> ${app.data.phone}</p>
        <p><strong>Plan:</strong> ${app.data.preferredPlan} | <strong>Status:</strong> ${app.data.nonprofitStatus}</p>
        <p><strong>Mission:</strong> ${app.data.mission}</p>
        <p><strong>Address:</strong> ${app.data.address}</p>
        ${app.data.details ? `<p><strong>Details:</strong> ${app.data.details}</p>` : ''}
        <p><strong>Submitted:</strong> ${new Date(app.data.submittedAt).toLocaleDateString()}</p>
        <div style="margin-top: 15px;">
          <form method="POST" style="display: inline;" onsubmit="return confirm('Delete this application? This cannot be undone!');">
            <input type="hidden" name="action" value="delete_grant">
            <input type="hidden" name="postId" value="${i}">
            <input type="hidden" name="username" value="${username}">
            <input type="hidden" name="password" value="${password}">
            <button type="submit" style="background: #dc3545; color: white; padding: 8px 15px; border: none; border-radius: 5px; cursor: pointer;">Delete</button>
          </form>
        </div>
      </div>
    `).join('')}

    ${grantApplications.length === 0 ? '<div class="service-card"><p>No grant applications yet.</p></div>' : ''}
  </div>

  <script>
    function createDots() {
      const dotsContainer = document.querySelector('.dots');
      for (let i = 0; i < 50; i++) {
        const dot = document.createElement('div');
        dot.className = 'dot';
        dot.style.left = Math.random() * 100 + '%';
        dot.style.top = Math.random() * 100 + '%';
        dot.style.width = Math.random() * 4 + 2 + 'px';
        dot.style.height = dot.style.width;
        dot.style.backgroundColor = 'rgba(205, 166, 24, 0.7)';
        dotsContainer.appendChild(dot);
      }
    }
    createDots();
  </script>
</body>
</html>`;
}