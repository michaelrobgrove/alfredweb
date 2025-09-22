export async function onRequest(context) {
  const { env } = context;
  
  try {
    // Get blog posts
    const posts = await env.BLOG_KV.get('posts');
    const postsData = JSON.parse(posts || '{"posts":[]}');
    
    // Static pages
    const staticPages = [
      { url: 'https://alfredwebdesign.com/', priority: '1.00', changefreq: 'monthly' },
      { url: 'https://alfredwebdesign.com/about.html', priority: '0.80', changefreq: 'monthly' },
      { url: 'https://alfredwebdesign.com/contact.html', priority: '0.80', changefreq: 'monthly' },
      { url: 'https://alfredwebdesign.com/alfred-ny-design.html', priority: '0.85', changefreq: 'monthly' },
      { url: 'https://alfredwebdesign.com/hornell-ny-design.html', priority: '0.85', changefreq: 'monthly' },
      { url: 'https://alfredwebdesign.com/canisteo-ny-design.html', priority: '0.80', changefreq: 'monthly' },
      { url: 'https://alfredwebdesign.com/roots-reach-community-grant.html', priority: '0.85', changefreq: 'monthly' },
      { url: 'https://alfredwebdesign.com/blog/', priority: '0.90', changefreq: 'daily' }
    ];
    
    // Blog post URLs
    const blogPages = postsData.posts.map(post => ({
      url: `https://alfredwebdesign.com/blog/${post.slug}`,
      priority: '0.70',
      changefreq: 'monthly',
      lastmod: new Date(post.date).toISOString().split('T')[0]
    }));
    
    const allPages = [...staticPages, ...blogPages];
    
    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allPages.map(page => `  <url>
    <loc>${page.url}</loc>
    <lastmod>${page.lastmod || new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`).join('\n')}
</urlset>`;

    return new Response(sitemap, {
      headers: { 'Content-Type': 'application/xml' }
    });
    
  } catch (error) {
    return new Response(`Error: ${error.message}`, { status: 500 });
  }
}