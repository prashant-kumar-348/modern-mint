import express from "express";
import cors from "cors";
import { errorHandler } from "./middleware/error.middleware";
import apiRoutes from "./routes/index";

const app = express();

// ── CORS ───────────────────────────────────────────────────────────────────

const allowedOrigins = (process.env.FRONTEND_URL ?? "http://localhost:3000")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no Origin header
      // Example: Postman, server-to-server requests
      if (!origin) {
        callback(null, true);
        return;
      }

      if (allowedOrigins.includes(origin)) {
        callback(null, true);
        return;
      }

      callback(
        Object.assign(
          new Error(`CORS policy: origin ${origin} is not allowed.`),
          { status: 403 }
        )
      );
    },

    credentials: true,

    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],

    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// ── Body parsers ───────────────────────────────────────────────────────────

app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true }));

// ── API Routes ─────────────────────────────────────────────────────────────

app.use("/api", apiRoutes);

// ── 404 ────────────────────────────────────────────────────────────────────

app.use((_req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found.",
  });
});

// ── Global error handler ───────────────────────────────────────────────────

app.use(errorHandler);

export default app;