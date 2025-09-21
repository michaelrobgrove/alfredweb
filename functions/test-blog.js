export async function onRequest(context) {
  const { env } = context;
  
  // Check if API key exists
  if (!env.GEMINI_API_KEY) {
    return new Response('GEMINI_API_KEY not found');
  }
  
  // Test basic API call
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${env.GEMINI_API_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: "Say hello" }] }]
    })
  });
  
  const text = await response.text();
  return new Response(`Status: ${response.status}, Response: ${text}`);
}