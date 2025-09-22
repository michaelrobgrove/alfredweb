// Contact form handler function - save as functions/contact-form.js
export async function onRequest(context) {
  const { env, request } = context;

  // Only allow POST requests
  if (request.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  try {
    const data = await request.json();
    
    // Validate required fields
    if (!data.name || !data.email || !data.phone) {
      return new Response('Missing required fields', { status: 400 });
    }

    // Get existing contact forms
    const contactFormsJson = await env.BLOG_KV.get('contact_forms');
    let contactForms = JSON.parse(contactFormsJson || '[]');
    if (!Array.isArray(contactForms)) {
      contactForms = [];
    }

    // Add new contact form submission
    contactForms.unshift({
      name: data.name,
      email: data.email,
      phone: data.phone,
      services: data.services || 'Not specified',
      details: data.details || '',
      submittedAt: data.submittedAt || new Date().toISOString()
    });

    // Save to KV
    await env.BLOG_KV.put('contact_forms', JSON.stringify(contactForms));

    return new Response('OK', { status: 200 });

  } catch (error) {
    console.error('Contact form error:', error);
    return new Response('Internal server error', { status: 500 });
  }
}