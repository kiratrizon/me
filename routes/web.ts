import { Route } from "Illuminate/Support/Facades/index.ts";
import MeController from "App/Http/Controllers/MeController.ts";
import MessageController from "App/Http/Controllers/MessageController.ts";

Route.get("/", [MeController, "index"]);

Route.get("/vc", [MeController, "vc"]);

Route.get("/connectVC", [MeController, "connectVC"]);

Route.get("/resume", async () => {
    let fileName = "genesis-troy-torrecampo.pdf";
    if (config("app").env !== "local") {
        if (config("app").url == "https://iam-throy.kiratrizon.deno.net") {
            fileName = "genesis-troy-torrecampo-2.pdf";
        }
    }
    return response().download(basePath(fileName),  "Genesis Troy Torrecampo (Web Developer).pdf");
});

Route.post("/send-message", [MessageController, "sendMessage"]);