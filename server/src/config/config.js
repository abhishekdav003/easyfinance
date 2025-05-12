const config = {
  email: {
    host: process.env.EMAIL_HOST || "smtp.gmail.com",
    port: parseInt(process.env.EMAIL_PORT || "587"),
    secure: process.env.EMAIL_SECURE === "true",
    user: process.env.EMAIL_USER || "your-email@gmail.com",
    password: process.env.EMAIL_PASSWORD || "your-app-password", // Use app password for Gmail
    senderName: process.env.EMAIL_SENDER_NAME || "Your App Name",
  },
};

export default config;
