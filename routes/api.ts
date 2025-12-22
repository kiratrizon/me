import { Route } from "Illuminate/Support/Facades/index.ts";
import MeController from "App/Http/Controllers/MeController.ts";

Route.get("/", async ({ request }) => {
  return response().json({ message: "API is working!" });
})

Route.post("/send-mail", [MeController, "sendMail"]).middleware(["throttle,1,1"]);