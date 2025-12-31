import Controller from "App/Http/Controllers/Controller.ts";
import {RtcTokenBuilder, RtcRole} from "agora-token";

// make manual mailer

import { SMTPClient } from "denomailer";
import { Cache } from "Illuminate/Support/Facades/index.ts";
import { randomInt } from "node:crypto";

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
                github_url: "https://github.com/kiratrizon/nemsu-sentiment-analysis",
                // live_demo_url: "https://sentiment-analysis.kiratrizon.deno.net",
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
                tls: config("mailer.tls") as boolean,
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

    public vc: HttpDispatch = async ({request}) => {
        const appId = env("AGORA_APP_ID") as string;
        const appCert = env("AGORA_APP_CERT") as string;
        const sessId = request.session.getId();
        // generate random uid
        const uid = 0;

        const role = RtcRole.PUBLISHER;
        const tokenExpirationInSecond = 3600
        const privilegeExpirationInSecond = 3600
        // generate random channel name
        let channelName = await Cache.get(`agora_channel_${sessId}`) as string;

        const isSaved = !!channelName;
        if (!isSaved) {
            channelName = `channel-${uid}-${Date.now()}`;
        }
        if (!isset(appCert)) {
            abort(400, "Missing Agora credentials");
        }
        
        const tokenWithUid = await Cache.get(`agora_token_${sessId}`) || RtcTokenBuilder.buildTokenWithUid(
            appId,
            appCert,
            channelName,
            uid,
            role,
            tokenExpirationInSecond,
            privilegeExpirationInSecond
        );

        // save
        if (!isSaved) {
            await Cache.put(`agora_token_${sessId}`, tokenWithUid, 3600);
            await Cache.put(`agora_channel_${sessId}`, channelName, 3600);

            // send mail
            const mailerClient = new SMTPClient({
                connection: {
                    hostname: config("mailer.host") as string,
                    port: config("mailer.port") as number,
                    tls: config("mailer.tls") as boolean,
                    auth: {
                        username: config("mailer.user") as string,
                        password: config("mailer.pass") as string,
                    },
                },
            });

            try {
                await mailerClient.send({
                    from: `App <${config("mailer.user")}>`,
                    to: "tgenesistroy@gmail.com",
                    subject: "Employer Wants to Connect",
                    html: `<p>Connect here: ${config("app").url}/connectVC?token=${tokenWithUid}&channel=${channelName}</p>`,
                    content: `Connect here: ${config("app").url}/connectVC?token=${tokenWithUid}&channel=${channelName}`,
                });

                await mailerClient.close();
            } catch (error) {
                console.error("Error sending email:", error);
            }
        }

        return view("vc", { token: tokenWithUid, channelName });
    }

    public connectVC: HttpDispatch = async ({request}) => {
        const token = request.query("token");
        const channelName = request.query("channel");
        const appId = env("AGORA_APP_ID") as string;

        if (!token || !channelName) {
            abort(400, "Missing token or channel");
        }

        return view("vc", { token, channelName, appId });
    }
}

export default MeController;