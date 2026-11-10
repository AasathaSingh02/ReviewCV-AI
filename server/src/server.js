import dotenv from "dotenv";
dotenv.config();
import cors from "cors";
import express from "express";
import mongoose from "mongoose";
import path from "path";
import { fileURLToPath } from "url";
import { dbConnect } from "./config/dbConnect.js";
import cookieParser from "cookie-parser";
import authRouter from "./routes/auth.route.js";
import resumeRouter from "./routes/resume.routes.js";
import session from "express-session";
import morgan from "morgan";
import jobMatchrouter from "./routes/jobMatch.route.js";
import adminRouter from "./routes/admin.route.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsDir = path.join(__dirname, "..", "uploads");

const app = express();

// Serve static uploaded resumes
app.use("/uploads", express.static(uploadsDir));


// Trust proxy BEFORE cookies or sessions
app.set("trust proxy", 1);

const configuredClientUrl = process.env.CLIENT_URL?.trim();
const allowedOrigins = [
  "https://resumindai-ashy.vercel.app",
  "https://review-cv-ai.vercel.app",
  "https://reviewcv-ai.vercel.app",
  "http://localhost:5173",
  "http://localhost:3000",
  "http://127.0.0.1:5173",
  configuredClientUrl,
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, server-to-server or curl requests)
    if (!origin) return callback(null, true);

    const isAllowed = allowedOrigins.includes(origin) ||
      /^https:\/\/[a-z0-9-]+(\.vercel\.app)$/.test(origin) ||
      (process.env.NODE_ENV === "development" && /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin));

    if (isAllowed) {
      return callback(null, true);
    }

    const msg = `The CORS policy does not allow access from origin: ${origin}. Please add it to CLIENT_URL in server .env`;
    return callback(new Error(msg), false);
  },
  credentials: true
}));


app.use(morgan("dev"));
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Request timeout middleware
app.use((req, res, next) => {
  // Set timeout to 60 seconds for all requests
  req.setTimeout(60000);
  res.setTimeout(60000);
  next();
});



app.get("/", (req, res) => {
  res.json({ message: "Server is running fine 🚀" });
});

// Enhanced health check
app.get("/healthcheck", async (req, res) => {
  const health = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    services: {
      database: 'unknown',
      email: 'unknown'
    }
  };

  try {
    // Check database connection
    if (mongoose.connection.readyState === 1) {
      health.services.database = 'connected';
    } else {
      health.services.database = 'disconnected';
      health.status = 'degraded';
    }

    // Check email configuration (Resend API)
    if (process.env.RESEND_API_KEY) {
      health.services.email = 'configured (Resend)';
    } else {
      health.services.email = 'not configured';
      health.status = 'degraded';
    }

    const statusCode = health.status === 'ok' ? 200 : 503;
    res.status(statusCode).json(health);
  } catch (error) {
    res.status(503).json({
      status: 'error',
      message: error.message
    });
  }
});

// AUTH Routes
app.use("/api/auth", authRouter);
app.use("/api/resume", resumeRouter);
app.use("/api/job", jobMatchrouter);


// ADMIN ROUTES
app.use("/api/admin", adminRouter)

// Global error handling middleware
app.use((err, req, res, next) => {
  console.error('[ERROR] Unhandled error:', {
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
  });

  // Send appropriate error response
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    error: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// Handle 404 routes
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Start HTTP server
const server = app.listen(PORT, () => {
  console.log(`[SERVER] 🚀 Server is running at http://localhost:${PORT}`);
  console.log(`[SERVER] Environment: ${process.env.NODE_ENV || 'development'}`);
});

// Connect to Database
dbConnect()
  .then(() => {
    console.log("[SERVER] ✅ Database connected and ready");
  })
  .catch((error) => {
    console.warn("[SERVER] ⚠️ Database connection pending or failed:", error.message);
    console.warn("[SERVER] 👉 To connect your database, paste your MongoDB URI in server/.env");
  });

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('[SERVER] Uncaught Exception:', error);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('[SERVER] Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('[SERVER] SIGTERM signal received: closing HTTP server');
  process.exit(0);
});


