import { Migration } from "Illuminate/Database/Migrations/index.ts";
import { Schema } from "Illuminate/Support/Facades/index.ts";
import { Blueprint } from "Illuminate/Database/Schema/index.ts";

export default new (class extends Migration {
  public async up() {
    await Schema.create("channels", (table: Blueprint) => {
        table.id();
        table.string("channel_name").notNullable();
        table.string("token").notNullable();
        table.timestamps();
      }
    );
  }

  public async down() {
    await Schema.dropIfExists("channels");
  }
})();
