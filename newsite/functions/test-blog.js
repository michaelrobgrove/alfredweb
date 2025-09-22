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
            text: `You are a content writer for Alfred Web Design & Shirts, located in Alfred, NY. 

**MANDATORY VARIETY RULE:** Each article must be completely different in style, topic, and tone. Check the existing topics below and pick something totally different.

**LOCATION GUIDELINES:**
- You serve Western New York businesses around Alfred, Hornell, Wellsville, Bath
- Only mention realistic local businesses for each town size
- Alfred: University town with restaurants, student services
- Hornell/Wellsville/Bath: Main Street businesses, local shops
- Avoid overusing "Southern Tier" - just say Western NY or specific town names

**TODAY'S FOCUS:**
Random seed: ${Date.now()}-${Math.floor(Math.random() * 10000)}
Date: ${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}

${(() => {
  const today = new Date();
  const month = today.getMonth() + 1;
  const day = today.getDate();

  // --- NEW SEASONAL LOGIC ---
  // Only trigger on the first 3 days of each season

  // First 3 days of Spring (starts March 20)
  if (month === 3 && day >= 20 && day <= 22) return "FIRST DAYS OF SPRING - Write about fresh starts, new designs, and spring cleaning for websites or branding.";

  // First 3 days of Summer (starts June 21)
  if (month === 6 && day >= 21 && day <= 23) return "FIRST DAYS OF SUMMER - Write about vibrant colors, outdoor marketing, and preparing business for summer events.";

  // First 3 days of Fall (starts Sept 22)
  if (month === 9 && day >= 22 && day <= 24) return "FIRST DAYS OF FALL - Write about autumn color palettes, back-to-school themes, or marketing for the harvest season.";

  // First 3 days of Winter (starts Dec 21)
  if (month === 12 && day >= 21 && day <= 23) return "FIRST DAYS OF WINTER - Write about holiday marketing, end-of-year website updates, or cozy, warm design themes.";
  
  // If it's not the start of a season, it's a regular day.
  return "REGULAR DAY";
})()}

**AVOID THESE EXISTING TOPICS:**
${existingTitles.length > 0 ? existingTitles.map(t => `- ${t}`).join('\n') : '- None yet'}

**TOPIC ROTATION - Pick ONE completely different approach:**

**STYLE A - Humorous/Entertaining:**
- "Comic Sans: The Font Everyone Loves to Hate"
- "Why Your Logo Looks Like It Was Made in 1995"
- "Design Disasters: When Clients Attack"
- "The Great Papyrus Debate"

**STYLE B - Practical Lists:**
- "7 T-Shirt Fabrics Explained Simply"
- "Top 10 Logo Design Mistakes"
- "5 Website Speed Fixes Anyone Can Do"
- "Best Color Combinations for Fall Marketing"

**STYLE C - Technical Deep-Dives:**
- "Understanding Print Resolution vs Screen Resolution"
- "Screen Printing vs Heat Transfer: Complete Comparison"
- "Mobile-First Design: Step-by-Step Guide"
- "Email Design Best Practices for 2025"

**STYLE D - Local Business Focus:**
- "How Bath Businesses Can Improve Their Signage"
- "Alfred University Student Market: Design Tips"
- "Hornell Main Street: Branding for Small Towns"
- "Creating Team Spirit: Uniform Design Psychology"

**STYLE E - Seasonal/Trendy:**
- "Fall 2025 Apparel Color Trends"
- "Holiday Marketing Design Calendar"
- "Back-to-School Promotional Items That Work"
- "Autumn Website Refresh Ideas"

**REQUIREMENTS:**
- 750 words, HTML format
- Vary your writing style completely from previous posts
- End with unique CTA including: 607-638-7887 | team@alfredwebdesign.com | www.alfredwebdesign.com
- Focus on ONE specific topic, not general overviews
- Be conversational but professional

**CRITICAL:** Make this article completely different in style and topic from anything listed above!`
          }]
        }]
      })
    });

    const geminiData = await geminiResponse.json();
    
    // Check if response is valid
    if (!geminiData.candidates || !geminiData.candidates[0] || !geminiData.candidates[0].content || !geminiData.candidates[0].content.parts || !geminiData.candidates[0].content.parts[0]) {
      throw new Error(`Invalid Gemini response: ${JSON.stringify(geminiData)}`);
    }
    
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
      excerpt: body.replace(/<[^>]*>/g, '').substring(0, 300) + '...',
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