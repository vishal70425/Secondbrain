import express from "express";
import connectDB from "./db";
import { Router } from "./route";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();

const app = express();

// CORS first
app.use(
  cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true,
  })
);
// OPTIONS handler for preflight
// app.options("/api/v1/*", cors());

// JSON parser
app.use(express.json());

connectDB();

// Mount your API router on the **path** '/api/v1', not a URL
app.use("/api/v1", Router);

const port = process.env.PORT || 4000;
app.listen(port, () => {
  console.log(`🚀 Server running on http://localhost:${port}/api/v1`);
});
