// app.js
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

// Middlewares
app.use(
  cors({
    origin: process.env.CORS_ORIGIN, // Ensure that the CORS origin is correctly set in your environment variables
    credentials: true, // Allow credentials to be sent with requests (like cookies or headers)
  })
);

app.use(express.urlencoded({ extended: true, limit: "20kb" })); // Handle URL-encoded data with a size limit
app.use(express.json({ limit: "20kb" })); // Handle JSON data with a size limit
app.use(express.static("public")); // Serve static files (e.g., photos, images)
app.use(cookieParser()); // Parse cookies



//import routes-----
import clientRouter from "./routes/agent.routes.js";
import adminRouter from "./routes/admin.routes.js"; //
// Routes
app.use("/api/v1/client", clientRouter); // Routes for client-related actions
app.use("/api/v1/admin", adminRouter); // Routes for admin-related actions (admin routes)

export default app;
