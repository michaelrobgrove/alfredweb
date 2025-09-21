export async function onRequest(context) {
  const { env } = context;
  
  try {
    // Get latest post
    const posts = await env.BLOG_KV.get('posts');
    const postsData = JSON.parse(posts || '{"posts":[]}');
    const latestPost = postsData.posts[0];
    
    if (!latestPost) {
      return new Response('No posts found');
    }
    
    // Check if already posted to FB today
    const today = new Date().toDateString();
    const lastFBPost = await env.BLOG_KV.get('last_fb_post');
    
    if (lastFBPost === today) {
      return new Response('Already posted to Facebook today');
    }
    
    // Create Facebook post
    const fbMessage = `${latestPost.title}\n\n${latestPost.excerpt}\n\nRead more: https://alfredwebdesign.com/blog/${latestPost.slug}`;
    
    const fbResponse = await fetch(`https://graph.facebook.com/v18.0/${env.FB_PAGE_ID}/feed`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: fbMessage,
        access_token: env.FB_ACCESS_TOKEN
      })
    });
    
    if (fbResponse.ok) {
      await env.BLOG_KV.put('last_fb_post', today);
      return new Response('Posted to Facebook successfully!');
    } else {
      const error = await fbResponse.text();
      return new Response(`Facebook error: ${error}`, { status: 500 });
    }
    
  } catch (error) {
    return new Response(`Error: ${error.message}`, { status: 500 });
  }
}