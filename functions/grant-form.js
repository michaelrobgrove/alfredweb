export async function onRequestPost(context) {
  try {
    const { env, request } = context;
    const formData = await request.formData();

    // Convert formData to a plain object
    const newApplication = {};
    for (const [key, value] of formData.entries()) {
      newApplication[key] = value;
    }
    
    // Add a submission timestamp
    newApplication.submittedAt = new Date().toISOString();

    // Get the existing applications from KV
    const grantAppsJson = await env.BLOG_KV.get('grant_applications');
    const grantApplications = JSON.parse(grantAppsJson || '[]');

    // Add the new application to the list
    grantApplications.unshift(newApplication); // Add to the beginning

    // Save the updated list back to KV
    await env.BLOG_KV.put('grant_applications', JSON.stringify(grantApplications));

    // Return a success response
    return new Response('Form submitted successfully!', { status: 200 });

  } catch (error) {
    // Return an error response
    return new Response(`Error submitting form: ${error.message}`, { status: 500 });
  }
}