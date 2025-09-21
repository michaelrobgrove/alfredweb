export async function onRequest(context) {
  const { env } = context;
  
  try {
    // Generate blog content with Gemini
    const geminiResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${env.GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: "Write a 500-word blog post about web design trends, SEO tips, or digital marketing for small businesses. Start with a catchy title on the first line, then the content."
          }]
        }]
      })
    });
    
    const geminiData = await geminiResponse.json();
    const content = geminiData.candidates[0].content.parts[0].text;
    
    // Parse content
    const lines = content.split('\n').filter(line => line.trim());
    const title = lines[0].replace(/^#+\s*/, '');
    const body = lines.slice(1).join('\n');
    
    const post = {
      title,
      content: body,
      excerpt: body.substring(0, 150) + '...',
      date: new Date().toISOString().split('T')[0],
      slug: title.toLowerCase().replace(/[^a-z0-9]+/g, '-').substring(0, 50)
    };
    
    // Get existing posts from KV
    const existingPosts = await env.BLOG_KV.get('posts');
    const postsData = existingPosts ? JSON.parse(existingPosts) : { posts: [] };
    
    // Add new post to beginning
    postsData.posts.unshift(post);
    
    // Save back to KV
    await env.BLOG_KV.put('posts', JSON.stringify(postsData));
    
    return new Response(`Post created and saved!\n\nTitle: ${post.title}\nSlug: ${post.slug}\n\nView at: /blog/${post.slug}`, {
      headers: { 'Content-Type': 'text/plain' }
    });
    
  } catch (error) {
    return new Response(`Error: ${error.message}`, { status: 500 });
  }
}