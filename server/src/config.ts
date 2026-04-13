import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const envSchema = z.object({
  PORT: z.coerce.number(),
  NODE_ENV: z.enum(["development", "production"]),
  JWT_SECRET: z.string().min(8),

  // MUST be provided (no default)
  CORS_ORIGIN: z.string().min(1),

  DATABASE_URL: z.string().min(1)
});

export const env = envSchema.parse(process.env);

// Convert CORS string → array
export const corsOrigins = env.CORS_ORIGIN.split(",").map((origin) =>
  origin.trim()
);