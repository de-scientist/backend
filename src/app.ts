import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import env from "./config/env.js";
import errorHandler from "./middlewares/errorHandler.js";

// Routes
import authRoutes from "./routes/authRoutes.js";
import eventRoutes from "./routes/eventRoutes.js";
import ministryRoutes from "./routes/ministryRoutes.js";
import prayerRoutes from "./routes/prayerRoutes.js";
import contactRoutes from "./routes/contactRoutes.js";
import newsletterRoutes from "./routes/newsletterRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import usersRoutes from "./routes/usersRoutes.js";
import resourcesRoutes from "./routes/resourcesRoutes.js";
import memberRoutes from "./routes/memberRoutes.js";
import mediaRoutes from "./routes/mediaRoutes.js";
import blogRoutes from "./routes/blogRoutes.js";

const app = express();

/* ───────────────────────────────
   Security & Trust
─────────────────────────────── */

// Helmet (Supabase-friendly CSP)
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);

// CORS — required for Supabase + frontend
app.use(
  cors({
    origin: env.frontendUrl,
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

/* ───────────────────────────────
   Rate limiting (safe for Render / Supabase)
─────────────────────────────── */

app.set("trust proxy", 1); // REQUIRED for Render / Vercel / Supabase edge

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
});

app.use("/api", limiter);

/* ───────────────────────────────
   Body parsing
─────────────────────────────── */

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: false, limit: "10mb" }));

/* ───────────────────────────────
   Logging
─────────────────────────────── */

app.use(
  morgan(process.env.NODE_ENV === "development" ? "dev" : "combined", {
    skip: (req) => req.url === "/health",
  })
);

/* ───────────────────────────────
   Health check (Render + Supabase)
─────────────────────────────── */

app.get("/health", (_req, res) => {
  res.status(200).json({
    status: "ok",
    env: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
  });
});

/* ───────────────────────────────
   API Routes
─────────────────────────────── */

app.use("/api/auth", authRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/ministries", ministryRoutes);
app.use("/api/prayer", prayerRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/newsletter", newsletterRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/users", usersRoutes);
app.use("/api/resources", resourcesRoutes);
app.use("/api/media", mediaRoutes);
app.use("/api/members", memberRoutes);
app.use("/api/blogs", blogRoutes);

/* ───────────────────────────────
   404 Handler
─────────────────────────────── */

app.use((_req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

/* ───────────────────────────────
   Error handler (last)
─────────────────────────────── */

app.use(errorHandler);

export default app;
