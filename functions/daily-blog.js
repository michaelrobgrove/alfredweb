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

TODAY'S DATE: ${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}

**SPECIAL DATE CHECKING:**
${(() => {
  const today = new Date();
  const month = today.getMonth() + 1;
  const day = today.getDate();
  
  // Holidays
  if (month === 1 && day === 1) return "NEW YEAR'S DAY - Write about fresh starts, rebranding, new business goals";
  if (month === 2 && day === 14) return "VALENTINE'S DAY - Write about romantic design themes, couple's apparel, love-themed marketing";
  if (month === 3 && day === 17) return "ST. PATRICK'S DAY - Write about green design themes, Irish-inspired graphics, festive apparel";
  if (month === 7 && day === 4) return "INDEPENDENCE DAY - Write about patriotic designs, red/white/blue themes, American flag apparel";
  if (month === 9 && day === 11) return "9/11 REMEMBRANCE - Write respectfully about memorial designs, patriotic tributes, honoring service members (somber, respectful tone)";
  if (month === 10 && day === 31) return "HALLOWEEN - Write about spooky designs, orange/black themes, costume-related apparel";
  if (month === 11 && (day >= 22 && day <= 28)) return "THANKSGIVING WEEK - Write about gratitude themes, autumn colors, family gathering apparel";
  if (month === 12 && day === 25) return "CHRISTMAS - Write about holiday designs, red/green themes, gift-related products";
  
  // Seasons (corrected)
  if ((month === 3 && day >= 20) || (month === 4) || (month === 5) || (month === 6 && day < 21)) return "SPRING SEASON - Write about fresh designs, pastel colors, spring marketing themes";
  if ((month === 6 && day >= 21) || (month === 7) || (month === 8) || (month === 9 && day < 23)) return "SUMMER SEASON - Write about bright colors, outdoor event apparel, summer marketing";
  if ((month === 9 && day >= 23) || (month === 10) || (month === 11) || (month === 12 && day < 21)) return "FALL SEASON - Write about autumn colors, back-to-school themes, harvest designs";
  if ((month === 12 && day >= 21) || (month === 1) || (month === 2) || (month === 3 && day < 20)) return "WINTER SEASON - Write about winter themes, holiday marketing, cold-weather apparel";
  
  return "REGULAR DAY - Follow normal topic rotation";
})()}

EXISTING BLOG TOPICS TO AVOID (don't write about these again):
${existingTitles.length > 0 ? existingTitles.map(t => `- ${t}`).join('\n') : '- None yet'}

**IMPORTANT:** If today is a special date above, prioritize that theme. If it's a regular day, pick from batches below.

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

Requirements: 750 words, HTML format, reference WESTERN NY towns (Hornell, Almond, Wellsville, Alfred, Canisteo, Greenwood, Bath, Penn Yan, Belmont, Friendship) NOT Hudson Valley, unique title, end with Alfred Web Design & Shirts CTA.

LOCATION NOTE: We are in WESTERN New York, NOT Hudson Valley. Reference our local area towns listed above.

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