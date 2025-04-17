import dotenv from "dotenv";
import connectDB from "./db/index.js";
import express from "express";

const app = express();
dotenv.config({
    path: "./env"
});
connectDB()
.then(()=>{
    app.listen(process.env.PORT ||8000 , ()=>{
        console.log(`server is running at port: ${process.env.PORT}`);
        app.on("error", (err) => { // app unable to listen (problem with port)
            console.log("App unable to connect : " ,err);
            
        })
    } )
})
.catch((err) => {
    console.log("MongoDB connection failed!!!", err);
})