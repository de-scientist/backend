import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import env from "./config/env.js";
import errorHandler from "./middlewares/errorHandler.ts";

// Import routes
import authRoutes from "./routes/authRoutes.ts";
import eventRoutes from "./routes/eventRoutes.ts";
import ministryRoutes from "./routes/ministryRoutes.ts";
import prayerRoutes from "./routes/prayerRoutes.ts";
import contactRoutes from "./routes/contactRoutes.ts";
import newsletterRoutes from "./routes/newsletterRoutes.ts";
import adminRoutes from "./routes/adminRoutes.ts";
import usersRoutes from "./routes/usersRoutes.ts";
import resourcesRoutes from "./routes/resourcesRoutes.ts";
import memberRoutes from "./routes/memberRoutes.ts";
import mediaRoutes from "./routes/mediaRoutes.ts";
import blogRoutes from "./routes/blogRoutes.ts";

const app = express();

// Security middleware
app.use(helmet());

// CORS configuration
app.use(
  cors({
    origin: env.frontendUrl,
    credentials: true,
  }),
);

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: "Too many requests from this IP, please try again later.",
});
app.use("/api/", limiter);

// Body parsing middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Logging
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// API routes
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

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

// Error handling middleware (must be last)
app.use(errorHandler);

export default app;
