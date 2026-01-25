import { BroadcastingConfig } from "./@types/index.d.ts";

const broadcasting: BroadcastingConfig = {
  default: "pusher",
  connections: {
    pusher: {
      driver: "pusher",
      key: env("PUSHER_APP_KEY") || "",
      secret: env("PUSHER_APP_SECRET") || "",
      app_id: env("PUSHER_APP_ID") || "",
      options: {
        cluster: env("PUSHER_APP_CLUSTER") || "mt1",
        useTLS: true,
      },
    },
  },
};

export default broadcasting;
