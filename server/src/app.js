import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

// cors middleware
app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
} ))

//url encoder
app.use(express.urlencoded({extended:true , limit:"20kb"}));

//json limit
app.use(express.json({limit:"20kb"}));

app.use(express.static("public"));

//cookie parser
app.use(cookieParser());


//routes import---------------

import clientRouter from "./routes/client.routes.js";

app.use("/api/v1/client", clientRouter); // ✅



export default app