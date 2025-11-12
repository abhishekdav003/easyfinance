import dotenv from "dotenv";
import connectDB from "./db/index.js";
import app from "./app.js";

// Load environment variables
dotenv.config({
  path: "./.env",
});

// ✅ Default route for Render testing
app.get("/", (req, res) => {
  res.send("✅ EasyFinance backend is running...");
});

// ✅ Health check route (Render uses it to check status)
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    message: "Backend running correctly",
  });
});

// ✅ Connect DB then start server
const startServer = async () => {
  try {
    await connectDB();

    const PORT = process.env.PORT || 3000;

    app.listen(PORT, () => {
      console.log(`✅ Server running on port: ${PORT}`);
    });
  } catch (error) {
    console.log("❌ MongoDB connection failed!", error);
  }
};

startServer();
