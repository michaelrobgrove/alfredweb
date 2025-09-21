export async function onRequest(context) {
  const { env } = context;
  
  if (!env.GEMINI_API_KEY) {
    return new Response('GEMINI_API_KEY not found');
  }
  
  // Use correct model name
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${env.GEMINI_API_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: "Say hello" }] }]
    })
  });
  
  const text = await response.text();
  return new Response(`Status: ${response.status}, Response: ${text}`);
}