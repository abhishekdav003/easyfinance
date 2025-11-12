import dotenv from "dotenv";
import connectDB from "./db/index.js";
import app from "./app.js"; 

dotenv.config({
  path: "./.env"
});

app.listen(process.env.PORT || 3000, () => {
  console.log("Server running...");
});

connectDB()
  .then(() => {
    app.listen(process.env.PORT || 8000, () => {
      console.log(`server is running at port: ${process.env.PORT}`);
    });

    app.on("error", (err) => {
      console.log("App unable to connect: ", err);
    });
  })
  .catch((err) => {
    console.log("MongoDB connection failed!!!", err);
  });
