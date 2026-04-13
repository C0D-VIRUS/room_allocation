import type { Response } from "express";
import { ZodError } from "zod";

export function handleServerError(res: Response, error: unknown) {
  if (error instanceof ZodError) {
    return res.status(400).json({
      message: "Validation failed",
      issues: error.flatten()
    });
  }

  return res.status(500).json({
    message: "Something went wrong on the server"
  });
}

