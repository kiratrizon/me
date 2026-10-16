import Honovel from "Honovel";

export default {
  fetch: (req, info) => Honovel.app.fetch(req, info),
} satisfies Deno.ServeDefaultExport;
