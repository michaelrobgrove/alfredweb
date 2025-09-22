export async function onRequest(context) {
  const { request, env } = context;
  
  if (request.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }
  
  try {
    const formData = await request.formData();
    
    // Extract form data
    const data = {
      name: formData.get('name'),
      organization: formData.get('organization'),
      address: formData.get('address'),
      phone: formData.get('phone'),
      email: formData.get('email'),
      mission: formData.get('mission'),
      nonprofitStatus: formData.get('nonprofit-status'),
      preferredPlan: formData.get('preferred-plan'),
      details: formData.get('details'),
      agreedTerms: formData.get('agree-terms'),
      submittedAt: new Date().toISOString()
    };
    
    // Store in KV with timestamp
    const timestamp = Date.now();
    await env.BLOG_KV.put(`grant_application_${timestamp}`, JSON.stringify(data));
    
    return new Response('Application submitted successfully', { 
      status: 200,
      headers: { 'Content-Type': 'text/plain' }
    });
    
  } catch (error) {
    return new Response(`Error: ${error.message}`, { status: 500 });
  }
}