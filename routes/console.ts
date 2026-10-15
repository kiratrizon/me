Deno.cron("fetch-api", "*/10 * * * *", async () => {
    try {
        const response = await fetch(
            "https://peculiarlads.onrender.com/api/pecu",
        );

        if (!response.ok) {
            console.error(`API returned ${response.status}`);
            return;
        }

        await response.body?.cancel();
        console.log("API ping successful");
    } catch (error) {
        console.error("API ping failed:", error);
    }
});