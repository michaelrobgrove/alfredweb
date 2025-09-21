export async function onRequest(context) {
  const { env } = context;
  
  // Generate content with Gemini
  const geminiResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${env.GEMINI_API_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{
        parts: [{
          text: "Write a 500-word blog post about web design trends, SEO tips, or digital marketing for small businesses. Include a catchy title."
        }]
      }]
    })
  });
  
  const geminiData = await geminiResponse.json();
  const content = geminiData.candidates[0].content.parts[0].text;
  
  // Parse title and content
  const lines = content.split('\n');
  const title = lines[0].replace(/^#+\s*/, '');
  const body = lines.slice(1).join('\n');
  
  const post = {
    title,
    content: body,
    excerpt: body.substring(0, 150) + '...',
    date: new Date().toISOString().split('T')[0],
    slug: title.toLowerCase().replace(/[^a-z0-9]+/g, '-')
  };
  
  // Continue in next step...
  
  return new Response('OK');
}