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

Your primary goal is to write a 500-word blog post that offers genuine value to one of our three core audiences: **Small Businesses, Non-Profits, or Consumers.**

**Instructions:**
1. **Select ONE Audience** to be the focus of today's article:
   * A) Small Business Owner / Entrepreneur
   * B) Non-Profit Organizer / Board Member
   * C) Consumer / Individual / Group (e.g., family reunion, local sports team)

2. **Based on your audience selection, choose ONE relevant topic** for the article. Here are some ideas:
   * **If you chose Small Business:** Write about local SEO strategies, designing effective business cards, the ROI of a professional website, or creating a cohesive brand identity.
   * **If you chose Non-Profit:** Write about designing a high-impact annual report, using branded apparel to unite volunteers, creating compelling visuals for a fundraising campaign, or web design tips for increasing online donations.
   * **If you chose Consumer/Group:** Write about creative design ideas for family reunion t-shirts, tips for designing custom apparel for a local sports team, or how to create a personalized poster for a special event (like a birthday or anniversary).

3. **Check today's date** to ensure all information and trends are current.

4. **Include actionable tips** - provide 3-5 specific, implementable steps readers can take immediately.

5. **Start with a catchy title** that speaks directly to your chosen audience (e.g., "5 T-Shirt Design Trends for Your Next Family Reunion" or "Is Your Website Costing Your Non-Profit Donations?").

6. **Tailor your writing style and tone** to the audience:
   * **Business:** Professional, informative, focused on growth and ROI.
   * **Non-Profit:** Inspiring, community-focused, centered on mission and impact.
   * **Consumer:** Fun, creative, friendly, and focused on personal projects and events.

7. **Include a relevant example or case study** - mention a hypothetical success story that relates to the topic (keep it brief, 1-2 sentences).

8. **Use subheadings** to break up the content and improve readability.

9. **End with a specific Call to Action (CTA)** that matches the audience and topic:
   * **Business CTA:** Focus on ROI and professional growth - "Ready to elevate your brand? Contact Alfred Web Design & Shirts today for a free quote on your next project."
   * **Non-Profit CTA:** Emphasize mission impact - "Let Alfred Web Design & Shirts help amplify your mission. Get in touch to see how our design services can boost your next campaign."
   * **Consumer CTA:** Highlight creativity and personalization - "Have a great idea for a custom shirt or design? Contact Alfred Web Design & Shirts to bring it to life!"

10. **Do not mention that you are an AI.** Write from the perspective of the creative agency's team.

**Format Requirements:**
- Use HTML formatting (<strong>bold</strong>, <h3>subheadings</h3>, <p>paragraphs</p>)
- Keep paragraphs under 4 sentences
- Write in second person ("you") to engage readers directly
- Include the current date reference naturally in the content
- When using location examples, reference local towns: Hornell, Almond, Wellsville, Alfred, Canisteo, Greenwood, Bath, Penn Yan, Belmont, or Friendship`
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