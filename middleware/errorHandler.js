// middleware/errorHandler.js

const allowedOrigins = [
  "https://www.admin.pizzeria-web.com",
  "https://admin.pizzeria-web.com",
  "https://pizzeria-web.com",
  "https://www.pizzeria-web.com",
];

export const errorHandler = (err, req, res, next) => {
  console.error("Unhandled error:", err);

  const statusCode = err.statusCode || 500;

  // Always set CORS headers, even on errors
  const origin = req.headers.origin;
  if (!origin || allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin || "*");
    res.setHeader("Access-Control-Allow-Credentials", "true");
  }

  res.status(statusCode).json({
    success: false,
    message: err.message || "Internal server error",
    // Only include stack in development
    ...(process.env.NODE_ENV !== "production" && { stack: err.stack }),
  });
};
