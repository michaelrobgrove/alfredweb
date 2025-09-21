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
            text: `You are a content writer for Alfred Web Design & Shirts, a full-service creative agency that provides web design, graphic design, and custom printing services.

CRITICAL: Each article must be completely different in topic, style, and approach. Use the random number ${Math.random()} to help ensure uniqueness.

**ARTICLE VARIETY REQUIREMENTS:**
Choose ONE completely different approach each time:
- Trend lists (Top 10 T-Shirt Design Trends for 2025)
- How-to guides (Step-by-Step: Design Your Team Logo)
- Funny/entertaining posts (Why Comic Sans Still Haunts Designers)
- Technical tutorials (Understanding Color Theory in Print)
- Industry insights (What Makes a Website Convert Visitors)
- Seasonal content (Holiday Marketing Design Ideas)
- Problem-solving posts (5 Logo Mistakes That Kill Your Brand)
- Inspirational stories (Small Business Branding Success Secrets)
- Comparison posts (Digital vs Print Marketing: Which Wins?)
- Behind-the-scenes (The Real Process of Creating Custom Shirts)

**TOPIC CATEGORIES (rotate between these):**
1. **Custom Apparel:** T-shirt printing, team uniforms, promotional wear, fabric choices, design placement, color matching
2. **Graphic Design:** Logo creation, branding, color theory, typography, print vs digital design, packaging design
3. **Web Design:** User experience, mobile optimization, e-commerce, SEO basics, website speed, accessibility
4. **Marketing:** Social media graphics, email design, promotional materials, seasonal campaigns, local advertising
5. **Business Tips:** Branding strategies, customer engagement, online presence, professional image, cost-effective marketing
6. **Fun/Creative:** Design humor, industry memes, creative inspiration, trend predictions, design failures

**AUDIENCE MIX:**
- Small Business Owners (professional, ROI-focused)
- Non-Profits (mission-driven, community-focused) 
- Consumers (fun, personal projects, family events)
- Sports Teams (performance, team spirit, durability)
- Event Planners (memorable, cohesive, timeline-focused)

**WRITING STYLE VARIETY:**
- Professional and informative
- Casual and conversational  
- Humorous but helpful
- Step-by-step instructional
- Trend-focused and trendy
- Problem/solution oriented

**REQUIREMENTS:**
- 750 words
- HTML formatting (<h3>, <strong>, <p>)
- 5-7 actionable tips when applicable
- Reference local NY towns occasionally: Hornell, Almond, Wellsville, Alfred, Canisteo, Greenwood, Bath
- End with relevant CTA for Alfred Web Design & Shirts
- NO repetitive topics or similar titles
- Make it genuinely different from previous articles

Write something completely fresh and engaging!`
          }]
        }]
      })
    });
    
    const geminiData = await geminiResponse.json();
    const content = geminiData.candidates[0].content.parts[0].text;
    
    // Better content parsing
    const cleanContent = content.replace(/^<!DOCTYPE.*?<\/html>$/s, '').trim();
    
    // Find first meaningful line as title
    const lines = cleanContent.split('\n').filter(line => line.trim());
    let title = '';
    let bodyStart = 0;
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].replace(/^#+\s*|<[^>]*>/g, '').trim();
      if (line.length > 10 && !line.match(/^\d{4}-\d{2}-\d{2}/) && !line.includes('DOCTYPE')) {
        title = line;
        bodyStart = i + 1;
        break;
      }
    }
    
    const body = lines.slice(bodyStart).join('\n');
    
    const post = {
      title,
      content: body,
      excerpt: body.replace(/<[^>]*>/g, '').substring(0, 150) + '...',
      date: new Date().toLocaleDateString('en-US', { 
        month: '2-digit', 
        day: '2-digit', 
        year: 'numeric' 
      }),
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