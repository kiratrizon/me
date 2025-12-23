export default class RedirectToNew {
  public handle: HttpMiddleware = async ({ request }, next) => {
    // Implement logic here
    if (config("app").url === "https://iam-throy.deno.dev") return redirect("https://iam-throy.kiratrizon.deno.net");
    return next();
  };
}
