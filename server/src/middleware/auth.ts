import type { RequestHandler } from "express";
import jwt from "jsonwebtoken";

export interface AuthedRequest extends Express.Request {
  userId?: string;
  role?: "USER" | "ADMIN";
}

export const requireAuth: RequestHandler = (req, res, next) => {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) return res.status(401).json({ error: "Unauthorized" });
  try {
    const payload = jwt.verify(header.slice(7), process.env.JWT_ACCESS_SECRET!) as {
      sub: string;
      role: "USER" | "ADMIN";
    };
    (req as any).userId = payload.sub;
    (req as any).role = payload.role;
    next();
  } catch {
    res.status(401).json({ error: "Invalid token" });
  }
};

export const requireAdmin: RequestHandler = (req, res, next) => {
  if ((req as any).role !== "ADMIN") return res.status(403).json({ error: "Forbidden" });
  next();
};