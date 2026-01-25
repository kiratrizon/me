import Controller from "App/Http/Controllers/Controller.ts";
import Pusher from "pusher"

class MessageController extends Controller {

    private static pusherClient: Pusher;
    // create function like this
    public sendMessage: HttpDispatch = async ({request}) => {
        MessageController.initPusherClient();
        const pusher = MessageController.pusherClient;
        const {channel, event, message, uid} = await request.validate({
            channel: "required",
            event: "required",
            message: "required|max:300",
            uid: "required"
        });

        await pusher.trigger(channel, event, { message, uid });
        return response().json({status: "Message sent"});
    }

    private static initPusherClient() {
        
        if (!MessageController.pusherClient) {
            const broadcasting = config("broadcasting");
            const pusherConfig = broadcasting.connections.pusher;
            MessageController.pusherClient = new Pusher({
                appId: pusherConfig.app_id,
                key: pusherConfig.key,
                secret: pusherConfig.secret,
                cluster: pusherConfig.options.cluster,
                useTLS: pusherConfig.options.useTLS,
            });
        }
    }
}

export default MessageController;