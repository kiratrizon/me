export default class RedirectToCurrent {
  public handle: HttpMiddleware = async ({ request }, next) => {
    // Implement logic here
    if (env("REDIRECT_TO_CURRENT")) {
      if (request.method === "GET") {
        return redirect("https://iam-throy.fly.dev");
      }
      abort(404, "Not Found");
    }
    return next();
  };
}
