import Controller from "App/Http/Controllers/Controller.ts";
import Project from "../../Models/Project.ts";

// make manual mailer

import { SMTPClient } from "denomailer";

class MeController extends Controller {
    // create function like this
    public index: HttpDispatch = async ({request}) => {
        // your logic here
        if (request.query("test") == 1) {
            dd([config("database").default, env("DB_CONNECTION", "mysql")]);
        }
        const projects = await Project.all();
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