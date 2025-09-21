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

Your primary goal is to write a 750-word blog post that offers genuine value to one of our three core audiences: **Small Businesses, Non-Profits, or Consumers.**

IMPORTANT: Make each article unique by varying your topic choice, writing style, and examples. Avoid repeating the same topics or using similar titles.

**Instructions:**
1. **Select ONE Audience** to be the focus of today's article:
   * A) Small Business Owner / Entrepreneur  
   * B) Non-Profit Organizer / Board Member
   * C) Consumer / Individual / Group (e.g., family reunion, local sports team)

2. **Based on your audience selection, choose ONE specific topic** (pick something different each time):
   * **Small Business:** Local SEO, business card design, website ROI, brand identity, social media marketing, email campaigns, online reviews management, competitive analysis
   * **Non-Profit:** Annual report design, volunteer t-shirts, fundraising graphics, donation page optimization, event marketing, newsletter design, social impact storytelling
   * **Consumer/Group:** Family reunion shirts, sports team uniforms, graduation party designs, wedding favors, birthday celebration gear, holiday cards, custom gifts

3. **Use today's date naturally in content and ensure information is current for ${new Date().getFullYear()}.**

4. **Include 5-7 actionable, specific tips** that readers can implement immediately.

5. **Create a unique, compelling title** that speaks directly to your chosen audience.

6. **Match your tone to the audience** but vary your approach each time.

7. **NO case studies or real business names.** Use only general examples.

8. **Use HTML subheadings** (<h3>) to organize content clearly.

9. **End with audience-appropriate CTA** mentioning Alfred Web Design & Shirts.

10. **Write from the agency team perspective** (never mention AI).

**Format Requirements:**
- HTML formatting (<strong>, <h3>, <p>)
- Paragraphs under 4 sentences  
- Second person ("you") engagement
- Reference local NY towns when relevant: Hornell, Almond, Wellsville, Alfred, Canisteo, Greenwood, Bath, Penn Yan, Belmont, Friendship

**Vary your approach each time to ensure unique, fresh content!**`
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