import express from "express";
import cors from "cors";
import { request as httpRequest } from "http";
import { errorHandler } from "./middleware/error.middleware";
import apiRoutes from "./routes/index";

const app = express();

// ── CORS ───────────────────────────────────────────────────────────────────
// FRONTEND_URL may be a comma-separated list to support multiple origins
// e.g.  FRONTEND_URL=https://modernmint.vercel.app,http://localhost:3000
app.use(
  cors((req, callback) => {
    const origin = req.header("Origin");
    const host = req.header("Host");

    const allowedOrigins = (process.env.FRONTEND_URL ?? "http://localhost:3000")
      .split(",")
      .map((o) => o.trim())
      .filter(Boolean);

    const isSameOrigin = origin && host && (origin === `http://${host}` || origin === `https://${host}`);

    if (!origin || allowedOrigins.includes(origin) || isSameOrigin) {
      callback(null, {
        origin: true,
        credentials: true,
        methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization"],
      });
    } else {
      const err = Object.assign(new Error(`CORS policy: origin ${origin} is not allowed.`), { status: 403 });
      callback(err);
    }
  })
);

// ── Body parsers ───────────────────────────────────────────────────────────
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true }));

// ── Routes ────────────────────────────────────────────────────────────────
app.use("/api", apiRoutes);

// ── Next.js Proxy ──────────────────────────────────────────────────────────
app.use((req, res, next) => {
  if (req.path.startsWith("/api") || req.path.startsWith("/socket.io")) {
    return next();
  }

  const options = {
    hostname: "127.0.0.1",
    port: 3000,
    path: req.url,
    method: req.method,
    headers: req.headers,
  };

  const proxyReq = httpRequest(options, (proxyRes) => {
    res.writeHead(proxyRes.statusCode || 200, proxyRes.headers);
    proxyRes.pipe(res, { end: true });
  });

  proxyReq.on("error", (err) => {
    console.error("[Proxy Error] Next.js is unreachable:", err.message);
    res.status(502).send("Frontend server (Next.js) is starting up or unreachable. Please refresh in a moment.");
  });

  req.pipe(proxyReq, { end: true });
});

// ── 404 catch-all ─────────────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ success: false, message: "Route not found." });
});

// ── Global error handler (must be last) ───────────────────────────────────
app.use(errorHandler);

export default app;
