import Controller from "App/Http/Controllers/Controller.ts";
import Project from "../../Models/Project.ts";

class MeController extends Controller {
    // create function like this
    public index: HttpDispatch = async ({request}) => {
        // your logic here
        const projects = await Project.all();
        const name = "Genesis Troy Torrecampo";
        const skills = {
            languages: ["HTML", "CSS", "JavaScript", "TypeScript", "PHP"],
            frameworks: ["Express.js", "Hono.js", "Laravel", "CakePHP", "React.js"],
            databases: ["MySQL", "MongoDB", "DynamoDB"],
            tools: ["Git", "Docker"],
            runtime: ["Deno", "Node.js"],
            "Third-party Services": ["AWS", "Clever Cloud", "Google Console"],
            deployment: ["Vercel", "Deno Deploy"],
        };

        return view("me", { projects, name, skills });
    }
}

export default MeController;