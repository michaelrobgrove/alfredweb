export async function onRequest(context) {
  const slug = context.params.slug;
  
  const posts = await context.env.BLOG_KV.get('posts');
  const postsData = JSON.parse(posts || '{"posts":[]}');
  const post = postsData.posts.find(p => p.slug === slug);
  
  if (!post) {
    return new Response('Post not found', { status: 404 });
  }
  
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${post.title} - Alfred Web Design</title>
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
      <a href="/services" class="nav-item">Services</a>
      <a href="/portfolio" class="nav-item">Portfolio</a>
      <a href="/contact" class="nav-item">Contact</a>
      <a href="/blog" class="nav-item active">Blog</a>
    </div>
  </nav>

  <div class="container">
    <div class="hero">
      <h1>${post.title}</h1>
      <p><small style="color: var(--gold);">${post.date}</small></p>
      <div style="text-align: left; margin-top: 20px; line-height: 1.6;">
        ${post.content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\n\n/g, '</p><p>').replace(/\n/g, '<br>')}
      </div>
      <div style="margin-top: 30px;">
        <a href="/blog" class="cta-button">← Back to Blog</a>
      </div>
    </div>
  </div>

  <footer>
    <div class="footer-content">
      <div class="footer-links">
        <a href="/" class="footer-link">Home</a>
        <a href="/services" class="footer-link">Services</a>
        <a href="/portfolio" class="footer-link">Portfolio</a>
        <a href="/contact" class="footer-link">Contact</a>
      </div>
      <div class="copyright">
        © 2024 Alfred Web Design. All rights reserved.
      </div>
    </div>
  </footer>

  <script>
    // Add dots animation
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
  
  return new Response(html, { 
    headers: { 'Content-Type': 'text/html' } 
  });
}