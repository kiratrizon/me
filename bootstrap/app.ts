import Application from "Illuminate/Foundation/Application.ts";
import NotFoundHttpException from "Illuminate/Foundation/HttpExceptions/NotFoundHttpException.ts";
import RedirectToCurrent from "App/Http/Middlewares/RedirectToCurrent.ts";

export default Application.withRouting({
  web: async () => await import("../routes/web.ts"),
  // api: async () => await import("../routes/api.ts"),
})
  .withMiddleware((middleware) => {
    middleware.append(RedirectToCurrent);
  })
  .withExceptions((exceptions) => {
    exceptions.render<typeof NotFoundHttpException>(
      NotFoundHttpException,
      async ({ request }, e) => {
        if (request.expectsJson() || request.is("api/*") || request.ajax()) {
          return response().json({ message: "Not Found" }, 404);
        }
        return "Not Found";
      },
    );
  })
  .create();
