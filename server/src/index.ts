import cors from "cors";
import express from "express";
import { env, corsOrigins } from "./config.js";
import { errorHandler } from "./middlewares/error-handler.js";
import { notFoundHandler } from "./middlewares/not-found.js";
import { apiRouter } from "./routes/index.js";

const app = express();

// Dynamic CORS (only from env)
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);

      if (corsOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error("CORS not allowed"));
    },
    credentials: true
  })
);

app.use(express.json());
app.set("trust proxy", 1);

// Health check
app.get("/", (_req, res) => {
  res.json({
    name: "Hostel Operations API",
    status: "ok",
    environment: env.NODE_ENV
  });
});

app.use("/api", apiRouter);
app.use(notFoundHandler);
app.use(errorHandler);

// Render-compatible port
app.listen(env.PORT, () => {
  console.log(`Server running on port ${env.PORT}`);
});