import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config.js";

type AuthTokenPayload = {
  sub: number;
  role: string;
  email: string;
};

type AuthenticatedRequest = Request & {
  authUser?: AuthTokenPayload;
};

export function authenticateToken(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const header = req.headers.authorization;

  if (!header?.startsWith("Bearer ")) {
    return res.status(401).json({
      message: "Authentication required"
    });
  }

  const token = header.slice("Bearer ".length);

  try {
    const payload = jwt.verify(token, env.JWT_SECRET) as unknown as AuthTokenPayload;
    (req as AuthenticatedRequest).authUser = payload;
    return next();
  } catch {
    return res.status(401).json({
      message: "Session expired or invalid. Please log in again."
    });
  }
}

export function requireAdmin(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const authUser = (req as AuthenticatedRequest).authUser;

  if (!authUser || authUser.role !== "ADMIN") {
    return res.status(403).json({
      message: "Admin access is required for this action"
    });
  }

  return next();
}
