export async function onRequest() {
  return Response.redirect('/blog/', 301);
}