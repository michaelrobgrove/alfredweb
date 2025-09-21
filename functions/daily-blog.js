export async function onRequest(context) {
  const { env } = context;
  
  try {
    // Get existing posts to check for duplicates
    const existingPosts = await env.BLOG_KV.get('posts');
    const postsData = existingPosts ? JSON.parse(existingPosts) : { posts: [] };
    const existingTitles = postsData.posts.map(p => p.title.toLowerCase());
    
    // Generate content with Gemini
    const geminiResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${env.GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `You are a content writer for Alfred Web Design & Shirts. Random seed: ${Date.now()}-${Math.floor(Math.random() * 10000)}

EXISTING BLOG TOPICS TO AVOID (don't write about these again):
${existingTitles.length > 0 ? existingTitles.map(t => `- ${t}`).join('\n') : '- None yet'}

MANDATORY: You MUST write about a completely different topic that hasn't been covered above.

**FORCE TOPIC ROTATION - Pick ONE that hasn't been used:**

BATCH A (Custom Apparel):
- T-shirt fabric guide (cotton vs polyester vs blends)
- Screen printing vs heat transfer comparison  
- Team uniform design psychology
- Custom embroidery placement strategies
- Promotional product ROI analysis
- Seasonal apparel marketing timing

BATCH B (Graphic Design):
- Typography mistakes that scream "amateur"
- Color psychology in branding
- Logo scalability testing methods
- Print resolution vs web resolution explained
- Packaging design trends for 2025
- Icon design best practices

BATCH C (Web Design):
- Website loading speed optimization
- Mobile-first design principles
- E-commerce conversion optimization
- Website accessibility compliance
- User experience testing methods
- WordPress vs custom development

BATCH D (Marketing):
- Social media graphic dimensions guide
- Email newsletter design templates
- Local advertising design tips
- Trade show banner effectiveness
- Business card psychology
- Direct mail design strategies

BATCH E (Fun/Creative):
- Worst design trends that need to die
- Client feedback horror stories (anonymous)
- Design inspiration sources
- Creative block solutions
- Industry tool reviews
- Design process behind-the-scenes

**WRITING STYLE OPTIONS:**
1. List-based (Top 10, Best 5, etc.)
2. Tutorial/How-to guide
3. Comparison post (vs/versus)
4. Problem-solution format
5. Trend prediction/analysis
6. Humorous but informative
7. Technical deep-dive
8. Beginner's guide
9. Advanced techniques
10. Industry insights

**AUDIENCE ROTATION:**
- Small businesses needing professional image
- Non-profits maximizing limited budgets  
- Consumers planning personal events
- Sports teams building identity
- Startups establishing brands

Requirements: 750 words, HTML format, local NY town references, unique title, end with Alfred Web Design & Shirts CTA.

CRITICAL: Pick a topic that's completely different from the existing ones listed above!`
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