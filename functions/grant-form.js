export async function onRequestPost(context) {
  try {
    const { env, request } = context;
    const formData = await request.formData();

    // Convert formData to a plain object
    const newApplication = {};
    for (const [key, value] of formData.entries()) {
      newApplication[key] = value;
    }
    
    // Add a submission timestamp and an initial status
    newApplication.submittedAt = new Date().toISOString();
    newApplication.status = 'pending';

    // Get the existing applications from KV
    const grantAppsJson = await env.BLOG_KV.get('grant_applications');
    const grantApplications = JSON.parse(grantAppsJson || '[]');

    // Add the new application to the list (at the beginning)
    grantApplications.unshift(newApplication);

    // Save the updated list back to KV
    await env.BLOG_KV.put('grant_applications', JSON.stringify(grantApplications));

    // Return a success response to the front-end
    return new Response('Form submitted successfully!', { status: 200 });

  } catch (error) {
    // Return an error response if something goes wrong
    return new Response(`Error submitting form: ${error.message}`, { status: 500 });
  }
}