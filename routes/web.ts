import { Route } from "Illuminate/Support/Facades/index.ts";
import MeController from "App/Http/Controllers/MeController.ts";

Route.get("/", [MeController, "index"]);

Route.get("/resume", async () => {
    return response().download(basePath("genesis-troy-torrecampo.pdf"),  "Genesis Troy Torrecampo (Web Developer).pdf");
});