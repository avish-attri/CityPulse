import express from "express";

import dotenv from "dotenv";

import cookieParser from "cookie-parser";

import cors from "cors";

import connectDB from "./config/db.js";

import { configureCloudinary } from "./config/cloudinary.js";

import { errorHandler } from "./middleware/errorHandler.js";

import { startCronJobs } from "./services/cronService.js";

import authRoutes from "./routes/authRoutes.js";

import pulseRoutes from "./routes/pulseRoutes.js";

import discoverRoutes from "./routes/discoverRoutes.js";

import questionRoutes from "./routes/questionRoutes.js";

import eventRoutes from "./routes/eventRoutes.js";

import nearbyRoutes from "./routes/nearbyRoutes.js";

import adminRoutes from "./routes/adminRoutes.js";

dotenv.config();

configureCloudinary();

connectDB();

const app = express();

app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",

    credentials: true,
  }),
);

app.use(express.json({ limit: "10mb" }));

app.use(express.urlencoded({ extended: true }));

app.use(cookieParser());

app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    app: "CityPulse",
    timestamp: new Date().toISOString(),
  });
});

app.use("/api/auth", authRoutes);

app.use("/api/pulse", pulseRoutes);

app.use("/api/discover", discoverRoutes);

app.use("/api/questions", questionRoutes);

app.use("/api/events", eventRoutes);

app.use("/api/nearby", nearbyRoutes);

app.use("/api/admin", adminRoutes);

app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`CityPulse API running on port ${PORT}`);

  startCronJobs();
});
