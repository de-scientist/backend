import app from "./app.ts";
import env from "./config/env.js";

const server = app.listen(env.port, () => {
  console.log(`🚀 Server running in ${env.nodeEnv} mode on port ${env.port}`);
  console.log(`📍 API available at http://localhost:${env.port}/api`);
});

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("SIGTERM signal received: closing HTTP server");
  server.close(() => {
    console.log("HTTP server closed");
    process.exit(0);
  });
});

process.on("SIGINT", () => {
  console.log("SIGINT signal received: closing HTTP server");
  server.close(() => {
    console.log("HTTP server closed");
    process.exit(0);
  });
});
