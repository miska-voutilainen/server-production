import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import { connectDB } from "./config/db.js";
import createSessionService from "./services/session.service.js";
import { errorHandler } from "./middleware/errorHandler.js";
import createAuthRouter from "./routes/auth.routes.js";
import createAdminRouter from "./routes/admin.routes.js";
import createOrderRouter from "./routes/order.routes.js";
import createProductRouter from "./routes/product.routes.js";
import createCouponRouter from "./routes/coupon.routes.js";
import createNewsletterRouter from "./routes/newsletter.routes.js";
import createIngredientsRouter from "./routes/ingredients.routes.js";

const app = express();

// CORS Configuration - Secure and Production-Ready
const allowedOrigins = [
  "https://www.admin.pizzeria-web.com",
  "https://admin.pizzeria-web.com",
  "https://pizzeria-web.com",
  "https://www.pizzeria-web.com",
];

// CORS Options
const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.warn(`CORS blocked origin: ${origin}`);
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "Cookie"],
  optionsSuccessStatus: 200,
};

// Apply CORS middleware
app.use(cors(corsOptions));

// Body Parsers
app.use(express.json());
app.use(cookieParser());

// Database and Session
const pool = await connectDB();
const sessionService = createSessionService(pool);
app.use(sessionService.sessionMiddleware);

// Health Check Endpoint
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Routes
app.use("/api/auth", createAuthRouter(pool, sessionService));
app.use("/api/admin", createAdminRouter(pool));
app.use("/api/orders", createOrderRouter(pool));
app.use("/api/products", createProductRouter(pool));
app.use("/api/coupons", createCouponRouter(pool));
app.use("/api/newsletter", createNewsletterRouter(pool));
app.use("/api/ingredients", createIngredientsRouter(pool));

// 404 Handler

// 404 Handler with CORS fallback
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", req.headers.origin || "*");
  res.header("Access-Control-Allow-Credentials", "true");
  res.header(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization, Cookie"
  );
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  const err = new Error(`Can't find ${req.originalUrl} on this server!`);
  err.statusCode = 404;
  next(err);
});

// Error handler with CORS fallback
app.use((err, req, res, next) => {
  res.header("Access-Control-Allow-Origin", req.headers.origin || "*");
  res.header("Access-Control-Allow-Credentials", "true");
  res.header(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization, Cookie"
  );
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  errorHandler(err, req, res, next);
});

// Critical for Azure
const PORT = process.env.PORT || 3001;
const HOST = "0.0.0.0";

// Start Server
app.listen(PORT, HOST, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || "development"}`);
});
