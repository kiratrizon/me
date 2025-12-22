import { Migration } from "Illuminate/Database/Migrations/index.ts";
import { Schema } from "Illuminate/Support/Facades/index.ts";
import { Blueprint } from "Illuminate/Database/Schema/index.ts";

export default new (class extends Migration {
  public async up() {
    await Schema.create("projects", (table: Blueprint) => {
        table.id();
        table.string("project_name");
        table.string("description");
        table.string("github_url");
        table.string("live_demo_url");
        table.timestamps();
      }
    );
  }

  public async down() {
    await Schema.dropIfExists("projects");
  }
})();
