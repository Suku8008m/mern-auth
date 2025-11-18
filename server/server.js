import express from "express";
import cors from "cors";
import "dotenv/config";
import cookieParser from "cookie-parser";

import connectDB from "./config/mongodb.js";
import authRouter from "./routes/authRoutes.js";
import userRouter from "./routes/userRoute.js";

const app = express();
const port = process.env.PORT || 4000;

// Database
connectDB();

// --- CORS CONFIG ---
app.use(cors({
  origin: (origin, callback) => {
    const allowed = [
      "http://localhost:5173",
      "https://mern-auth-frontend-wnfw.onrender.com"
    ];

    if (!origin || allowed.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true
}));


// Middleware
app.use(express.json());
app.use(cookieParser());

// Routes
app.use("/api/auth", authRouter);
app.use("/api/user", userRouter);

// Health Check
app.get("/health", (req, res) => res.send("OK"));

app.get("/", (req, res) => res.send("Backend is Running"));

// Start Server
app.listen(port, () => console.log(`Server running on port ${port}`));
