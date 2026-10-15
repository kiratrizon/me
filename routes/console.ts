Deno.cron("fetch-api", "*/10 * * * *", async () => {

    const fetched = await fetch("https://peculiarlads.onrender.com/api/pecu");
    await fetched.json();
})