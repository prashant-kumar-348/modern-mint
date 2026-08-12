import express from "express";
import cors from "cors";
import { errorHandler } from "./middleware/error.middleware";
import apiRoutes from "./routes/index";

const app = express();

// ── CORS ───────────────────────────────────────────────────────────────────

const allowedOrigins = [
  "https://modern-mint.vercel.app",
  "http://localhost:3000",
  "http://localhost:5173",
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests without Origin
      if (!origin) {
        callback(null, true);
        return;
      }

      // Allow production Vercel URL
      if (allowedOrigins.includes(origin)) {
        callback(null, true);
        return;
      }

      // Allow all ModernMint Vercel preview deployments
      const isModernMintVercelPreview =
        /^https:\/\/modern-mint-[a-z0-9-]+-prashant28\.vercel\.app$/i.test(
          origin
        );

      if (isModernMintVercelPreview) {
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

    methods: [
      "GET",
      "POST",
      "PUT",
      "PATCH",
      "DELETE",
      "OPTIONS",
    ],

    allowedHeaders: [
      "Content-Type",
      "Authorization",
    ],
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