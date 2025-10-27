import express from "express";
import cors from "cors";
import "dotenv/config";

import cookieParser from "cookie-parser";
import connectDB from "./config/mongodb.js";
import authRouter from "./routes/authRoutes.js";
import userRouter from "./routes/userRoute.js";

const app = express();

const port = process.env.PORT || 4000;
connectDB();
const allowedOrigins = ["http://localhost:5173"];
app.use(express.json()); //All the request will be passed using json
app.use(cookieParser());
app.use(cors({ origin: allowedOrigins, credentials: true })); //Add fronteend link to it We can send the cookies in the response from express app
//API End Points
app.use("/api/auth", authRouter);
app.use("/api/user", userRouter);

app.get("/", (req, res) => res.send("Backend Is Working using Nodemon"));

app.listen(port, () => console.log(`Server Running on Port ${port}`));
