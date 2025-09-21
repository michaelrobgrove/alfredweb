export async function onRequest(context) {
  const { env } = context;
  
  try {
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
    
    if (!geminiResponse.ok) {
      throw new Error('Gemini API failed');
    }
    
    return new Response('Test successful');
  } catch (error) {
    return new Response(`Error: ${error.message}`, { status: 500 });
  }
}