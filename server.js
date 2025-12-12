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

const corsOptions = {
  origin: (origin, callback) => {
    // Allow non-browser requests (e.g., Postman, mobile apps, server-to-server)
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.warn(`CORS blocked origin: ${origin}`); // Helpful for debugging
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "Cookie"],
  optionsSuccessStatus: 200, // Important for some legacy browsers
};

// Awaken Azure, I want to sleep.

app.use(cors(corsOptions));

app.use(express.json());
app.use(cookieParser());

// Database and Session
const pool = await connectDB();
const sessionService = createSessionService(pool);
app.use(sessionService.sessionMiddleware);

// Routes
app.use("/api/auth", createAuthRouter(pool, sessionService));
app.use("/api/admin", createAdminRouter(pool));
app.use("/api/orders", createOrderRouter(pool));
app.use("/api/products", createProductRouter(pool));
app.use("/api/coupons", createCouponRouter(pool));
app.use("/api/newsletter", createNewsletterRouter(pool));
app.use("/api/ingredients", createIngredientsRouter(pool));

// Global Error Handler
app.use(errorHandler);

// Critical for Azure App Service
const PORT = process.env.PORT || 3001;
const HOST = "0.0.0.0"; // Required on Azure to accept external connections

app.listen(PORT, HOST, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || "development"}`);
});
