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
            text: `You are a hyperlocal content writer for Alfred Web Design & Shirts. Your entire focus is on the businesses and communities of the Southern Tier region of Western New York.

**CRITICAL LOCATION DIRECTIVE:**
Your entire identity is rooted in Western New York. You are based in Alfred, NY, and you serve the surrounding towns. When you need to mention a location, you MUST ONLY use towns from this list: Hornell, Almond, Wellsville, Alfred, Canisteo, Greenwood, Bath, Penn Yan, Belmont, and Friendship.

Your writing should sound like it comes from a local who understands the area. Frame all your advice through the lens of a small business helping other small businesses in this specific region.

---
Random seed: ${Date.now()}-${Math.floor(Math.random() * 10000)}

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

  // Fun National Days
  const firstFridayInJune = 6; // Example for 2025
  if (month === 6 && day === firstFridayInJune) return "NATIONAL DONUT DAY - Write about how local businesses like bakeries in Hornell or Wellsville can use branded packaging (graphic design) or custom staff uniforms (shirts) to stand out.";
  
  const thirdWednesdayInJuly = 16; // Example for 2025
  if (month === 7 && day === thirdWednesdayInJuly) return "NATIONAL HOT DOG DAY - Tie this into how a food vendor or restaurant in Alfred could use a mobile-friendly website (web design) to share their menu or custom stickers (promotional products) for branding.";
  
  if (month === 9 && day === 29) return "NATIONAL COFFEE DAY - Write about how coffee shops in Bath or Penn Yan can boost sales with loyalty cards (graphic design) and a strong online presence (web design).";

  // Seasons (corrected)
  if ((month === 3 && day >= 20) || (month === 4) || (month === 5) || (month === 6 && day < 21)) return "SPRING SEASON - Write about fresh designs, pastel colors, spring marketing themes";
  if ((month === 6 && day >= 21) || (month === 7) || (month === 8) || (month === 9 && day < 23)) return "SUMMER SEASON - Write about bright colors, outdoor event apparel, summer marketing";
  if ((month === 9 && day >= 23) || (month === 10) || (month === 11) || (month === 12 && day < 21)) return "FALL SEASON - Write about autumn colors, back-to-school themes, harvest designs";
  if ((month === 12 && day >= 21) || (month === 1) || (month === 2) || (month === 3 && day < 20)) return