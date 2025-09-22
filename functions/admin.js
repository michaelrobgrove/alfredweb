export async function onRequest(context) {
  const { env, request } = context;

  try {
    // --- Data Fetching ---
    // Always fetch both posts and applications at the beginning
    const postsJson = await env.BLOG_KV.get('posts');
    const grantAppsJson = await env.BLOG_KV.get('grant_applications');
    const postsData = JSON.parse(postsJson || '{"posts":[]}');
    let grantApplicationsData = JSON.parse(grantAppsJson || '[]');

    // Safety check to ensure grantApplicationsData is always an array
    if (!Array.isArray(grantApplicationsData)) {
      grantApplicationsData = [];
    }

    // --- POST Request Handling (Actions) ---
    if (request.method === 'POST') {
      const formData = await request.formData();
      const username = formData.get('username');
      const password = formData.get('password');

      if (username !== env.ADMIN_USERNAME || password !== env.ADMIN_PASSWORD) {
        return new Response(loginForm('Invalid credentials'), { headers: { 'Content-Type': 'text/html' } });
      }

      const action = formData.get('action');
      const entryId = formData.get('entryId'); // Renamed for clarity
      let message = '';

      if (action === 'delete_post' && entryId !== null) {
        postsData.posts.splice(parseInt(entryId), 1);
        await env.BLOG_KV.put('posts', JSON.stringify(postsData));
        message = 'Post deleted successfully.';
      } else if (action === 'clear_posts') {
        await env.BLOG_KV.put('posts', '{"posts":[]}');
        postsData.posts = [];
        message = 'All posts cleared.';
      } else if (action === 'delete_grant' && entryId !== null) {
        grantApplicationsData.splice(parseInt(entryId), 1);
        await env.BLOG_KV.put('grant_applications', JSON.stringify(grantApplicationsData));
        message = 'Grant application deleted successfully.';
      }
      
      return new Response(adminDashboard(postsData.posts, grantApplicationsData, message, username, password), {
        headers: { 'Content-Type': 'text/html' }
      });
    }

    // --- GET Request Handling (Show Login) ---
    return new Response(loginForm(), { headers: { 'Content-Type': 'text/html' } });

  } catch (error) {
    return new Response(`Error: ${error.message}`, { status: 500 });
  }
}


function loginForm(error = '') {
  // The login form HTML you provided is fine and doesn't need changes.
  // It should be placed here.
  return `<!DOCTYPE html>...`; // Collapsed for brevity
}

function adminDashboard(posts, grantApplications, message = '', username, password) {
  // This is the full dashboard HTML from your file, with no changes needed here.
  // It will now receive the correct data.
  return `<!DOCTYPE html>...`; // Collapsed for brevity
}