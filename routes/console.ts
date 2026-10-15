Deno.cron("fetch api", "10/* * * * *", async () => {

    await fetch("https://peculiarlads.onrender.com/api/pecu")
})