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
        live_demo_url: "https://honovel.deno.dev",
      },
      {
        project_name: "Sentiment Analysis (Unoptimized)",
        description: "A web application that analyzes the sentiment of a given text using machine learning.",
        github_url: "https://github.com/kiratrizon/nemsu-sentiment-analysis",
        live_demo_url: "https://sentiment-analysis.kiratrizon.deno.net",
      }
    ];

    for (const project of projects) {
      await Project.create(project);
    }
  }
}
