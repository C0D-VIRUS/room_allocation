import cors from "cors";
import express from "express";
import { env } from "./config.js";
import { errorHandler } from "./middlewares/error-handler.js";
import { notFoundHandler } from "./middlewares/not-found.js";
import { apiRouter } from "./routes/index.js";

const app = express();

app.use(
  cors({
    origin: env.CORS_ORIGIN.split(",").map((origin) => origin.trim())
  })
);
app.use(express.json());
app.set("trust proxy", 1);

app.get("/", (_req, res) => {
  res.json({
    name: "Hostel Operations API",
    status: "ok",
    docsHint: "Use /api/* routes for dashboard, students, rooms, complaints, fees, and reports."
  });
});

app.use("/api", apiRouter);
app.use(notFoundHandler);
app.use(errorHandler);

app.listen(env.PORT, () => {
  console.log(`Server running on http://localhost:${env.PORT}`);
});
