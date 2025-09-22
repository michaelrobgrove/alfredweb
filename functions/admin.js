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
              <input type="hidden