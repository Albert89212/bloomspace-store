import { Router } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import rateLimit from "express-rate-limit";
import { z } from "zod";
import crypto from "node:crypto";
import { prisma } from "../index.js";

export const authRouter = Router();

// Anti-bruteforce: 10 login attempts / 15 min / IP
const loginLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 10 });

const signupSchema = z.object({
  email: z.string().trim().email().max(255),
  password: z.string().min(8).max(128),
  name: z.string().trim().max(100).optional(),
  offerAccepted: z.literal(true),
  privacyAccepted: z.literal(true),
});

authRouter.post("/signup", async (req, res, next) => {
  try {
    const data = signupSchema.parse(req.body);
    const existing = await prisma.user.findUnique({ where: { email: data.email } });
    if (existing) return res.status(409).json({ error: "Email already registered" });

    const passwordHash = await bcrypt.hash(data.password, 12);
    const user = await prisma.user.create({
      data: { email: data.email, name: data.name, passwordHash },
    });

    await prisma.agreement.create({
      data: {
        userId: user.id,
        offerAccepted: data.offerAccepted,
        privacyAccepted: data.privacyAccepted,
        ip: req.ip ?? "",
        userAgent: req.headers["user-agent"] ?? "",
      },
    });

    const tokens = await issueTokens(user.id, user.role);
    res.status(201).json({ user: publicUser(user), ...tokens });
  } catch (e) {
    next(e);
  }
});

const loginSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(1),
});

authRouter.post("/login", loginLimiter, async (req, res, next) => {
  try {
    const data = loginSchema.parse(req.body);
    const user = await prisma.user.findUnique({ where: { email: data.email } });
    if (!user) return res.status(401).json({ error: "Invalid credentials" });
    const ok = await bcrypt.compare(data.password, user.passwordHash);
    if (!ok) return res.status(401).json({ error: "Invalid credentials" });

    const tokens = await issueTokens(user.id, user.role);
    res.json({ user: publicUser(user), ...tokens });
  } catch (e) {
    next(e);
  }
});

authRouter.post("/refresh", async (req, res, next) => {
  try {
    const { refreshToken } = z.object({ refreshToken: z.string() }).parse(req.body);
    const payload = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET!) as {
      sub: string;
      role: "USER" | "ADMIN";
      jti: string;
    };
    const hash = crypto.createHash("sha256").update(refreshToken).digest("hex");
    const record = await prisma.refreshToken.findUnique({ where: { tokenHash: hash } });
    if (!record || record.revokedAt || record.expiresAt < new Date())
      return res.status(401).json({ error: "Invalid refresh" });

    await prisma.refreshToken.update({
      where: { id: record.id },
      data: { revokedAt: new Date() },
    });

    const tokens = await issueTokens(payload.sub, payload.role);
    res.json(tokens);
  } catch {
    res.status(401).json({ error: "Invalid refresh" });
  }
});

function publicUser(u: { id: string; email: string; name: string | null; role: string }) {
  return { id: u.id, email: u.email, name: u.name, role: u.role };
}

async function issueTokens(userId: string, role: "USER" | "ADMIN") {
  const accessToken = jwt.sign({ sub: userId, role }, process.env.JWT_ACCESS_SECRET!, {
    expiresIn: process.env.JWT_ACCESS_TTL ?? "15m",
  });
  const jti = crypto.randomUUID();
  const refreshToken = jwt.sign({ sub: userId, role, jti }, process.env.JWT_REFRESH_SECRET!, {
    expiresIn: process.env.JWT_REFRESH_TTL ?? "30d",
  });
  const tokenHash = crypto.createHash("sha256").update(refreshToken).digest("hex");
  await prisma.refreshToken.create({
    data: {
      userId,
      tokenHash,
      expiresAt: new Date(Date.now() + 30 * 24 * 3600 * 1000),
    },
  });
  return { accessToken, refreshToken };
}