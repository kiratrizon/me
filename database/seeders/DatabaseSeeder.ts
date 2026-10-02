import Seeder from "Illuminate/Database/Seeder.ts";
import Project from "App/Models/Project.ts";

export default class DatabaseSeeder extends Seeder {
  public async run() {
    const projects = [
      {
        project_name: "Honovel",
        description:
          "A Laravel-like typescript-only web framework powered by Deno and Hono.",
        github_url: "https://github.com/kiratrizon/honovel",
        live_demo_url: "https://honovel.kiratrizon.deno.net",
      },
      {
        project_name: "Sentiment Analysis (Unoptimized)",
        description:
          "A web application that analyzes the sentiment of a given text using machine learning.",
        github_url: "https://github.com/kiratrizon/nemsu-sentiment-analysis",
        live_demo_url: "https://sentiment-analysis.kiratrizon.deno.net",
      },
      {
        project_name:
          "PeculiarLads website w/ discord bot. (Currently running on local tunnel)",
        description:
          "Just a member monitoring in entire guild for the game called Dragon Nest. A first project using Honovel.",
        github_url: "https://github.com/kiratrizon/peculiar-lads",
        live_demo_url: "https://peculiarlads.kiratrizon.deno.net",
      },
    ];

    for (const project of projects) {
      await Project.create(project);
    }
  }
}
