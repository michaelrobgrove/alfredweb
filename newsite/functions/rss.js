// Helper function to escape special XML characters
function escapeXml(unsafe) {
  return unsafe.replace(/[<>&"']/g, function (c) {
    switch (c) {
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '&': return '&amp;';
      case '"': return '&quot;';
      case "'": return '&apos;';
    }
  });
}

export async function onRequest(context) {
  const posts = await context.env.BLOG_KV.get('posts');
  const postsData = JSON.parse(posts || '{"posts":[]}');

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>Alfred Web Design &amp; Shirts Blog</title>
    <description>Web design, graphic design, and custom printing insights</description>
    <link>https://alfredwebdesign.com/blog/</link>
    ${postsData.posts.map(post => `
    <item>
      <title>${escapeXml(post.title)}</title>
      <description>${escapeXml(post.excerpt)}</description>
      <link>https://alfredwebdesign.com/blog/${post.slug}</link>
      <pubDate>${new Date(post.date).toUTCString()}</pubDate>
    </item>`).join('')}
  </channel>
</rss>`;

  return new Response(rss, {
    headers: { 'Content-Type': 'application/rss+xml' }
  });
}