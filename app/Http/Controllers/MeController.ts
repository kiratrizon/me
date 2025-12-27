import Controller from "App/Http/Controllers/Controller.ts";
import Project from "../../Models/Project.ts";

// make manual mailer

import { SMTPClient } from "denomailer";

class MeController extends Controller {
    // create function like this
    public index: HttpDispatch = async () => {
        // your logic here
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
                // github_url: "https://github.com/kiratrizon/nemsu-sentiment-analysis",
                live_demo_url: "https://sentiment-analysis.kiratrizon.deno.net",
            }
        ];
        const name = "Genesis Troy Torrecampo";
        const skills = {
            languages: ["HTML", "CSS", "JavaScript", "TypeScript", "PHP"],
            frameworks: ["Express.js", "Hono.js", "Laravel", "CakePHP", "React.js"],
            databases: ["MySQL", "MongoDB", "DynamoDB"],
            tools: ["Git", "Docker", "Postman", "VS Code"],
            runtime: ["Deno", "Node.js"],
            "Third-party Services": ["AWS", "Clever Cloud", "Google Console"],
            deployment: ["Vercel", "Deno Deploy"],
        };

        return view("me", { projects, name, skills });
    }

    public sendMail: HttpDispatch = async ({request}) => {
        const body = await request.validate({
            name: "required",
            email: "required|email",
            message: "required|min:10",
        })

        const client = new SMTPClient({
            connection: {
                hostname: config("mailer.host") as string,
                port: config("mailer.port") as number,
                tls: config("mailer.secure") as boolean,
                auth: {
                    username: config("mailer.user") as string,
                    password: config("mailer.pass") as string,
                },
            },
        });

        try {
            await client.send({
                from: `${body.name} <${config("mailer.user")}>`,
                to: "tgenesistroy@gmail.com",
                subject: "Employer Message",
                html: `<p>You have a new message from (${body.email}):</p>
                    <p>${body.message}</p>`,
                content: `You have a new message from (${body.email}): ${body.message}`,
            });

            await client.close();
        } catch (error) {
            console.error("Error sending email:", error);
            return response().json({ success: false, error: "Failed to send email." }, 500);
        }

        return response().json({ success: true });
    }
}

export default MeController;