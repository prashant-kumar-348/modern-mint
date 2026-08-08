import express from "express";
import cors from "cors";
import { errorHandler } from "./middleware/error.middleware";
import apiRoutes from "./routes/index";

const app = express();

// ── CORS ───────────────────────────────────────────────────────────────────
// FRONTEND_URL may be a comma-separated list to support multiple origins
// e.g.  FRONTEND_URL=https://modernmint.vercel.app,http://localhost:3000
const allowedOrigins = (process.env.FRONTEND_URL ?? "http://localhost:3000")
  .split(",")
  .map((o) => o.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (curl, mobile apps, Postman)
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        const err = Object.assign(new Error(`CORS policy: origin ${origin} is not allowed.`), { status: 403 });
        callback(err);
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// ── Body parsers ───────────────────────────────────────────────────────────
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true }));

// ── Routes ────────────────────────────────────────────────────────────────
app.use("/api", apiRoutes);

// ── 404 catch-all ─────────────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ success: false, message: "Route not found." });
});

// ── Global error handler (must be last) ───────────────────────────────────
app.use(errorHandler);

export default app;
