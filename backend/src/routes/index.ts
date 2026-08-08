import { Router } from "express";
import authRoutes  from "./auth.routes";
import lobbyRoutes from "./lobby.routes";
import userRoutes  from "./users.routes";

const router = Router();

// Mount sub-routers
router.use("/auth",  authRoutes);
router.use("/lobby", lobbyRoutes);
router.use("/users", userRoutes);

// Health check — useful for Docker / load-balancer probes
router.get("/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

export default router;
