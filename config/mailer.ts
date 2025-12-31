const constant = {
    host: env("MAIL_HOST"),
    port: env("MAIL_PORT", 0),
    secure: true, // true if using port 465
    user: env("MAIL_USERNAME"),
    pass: env("MAIL_PASSWORD"),
    tls: env("APP_ENV") === "production" ? false:true
};

export default constant;