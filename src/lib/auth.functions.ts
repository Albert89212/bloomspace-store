import { createServerFn } from "@tanstack/react-start";
import { clearSession, useSession } from "@tanstack/react-start/server";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

const signupSchema = loginSchema.extend({
  name: z.string().min(2),
  referralCode: z.string().optional(),
});

export const serverSignup = createServerFn({ method: "POST" })
  .inputValidator((data) => signupSchema.parse(data))
  .handler(async ({ data }) => {
    const { registerUser } = await import("./auth.server");
    const user = await registerUser(data);
    const session = await useSession<{ userId: string }>({
      password: process.env.SESSION_SECRET || "sadova-dev-session-secret-change-in-production-32",
      name: "sadova-session",
      maxAge: 60 * 60 * 24 * 30,
      cookie: { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/" },
    });
    await session.update({ userId: user.id });
    return { ok: true, user };
  });

export const serverLogin = createServerFn({ method: "POST" })
  .inputValidator((data) => loginSchema.parse(data))
  .handler(async ({ data }) => {
    const { authenticateUser } = await import("./auth.server");
    const user = await authenticateUser(data.email, data.password);
    const session = await useSession<{ userId: string }>({
      password: process.env.SESSION_SECRET || "sadova-dev-session-secret-change-in-production-32",
      name: "sadova-session",
      maxAge: 60 * 60 * 24 * 30,
      cookie: { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/" },
    });
    await session.update({ userId: user.id });
    return { ok: true, user };
  });

export const serverMe = createServerFn({ method: "GET" }).handler(async () => {
  const session = await useSession<{ userId?: string }>({
    password: process.env.SESSION_SECRET || "sadova-dev-session-secret-change-in-production-32",
    name: "sadova-session",
  });
  if (!session.data.userId) return { user: null };
  const { getSafeUser } = await import("./auth.server");
  const user = await getSafeUser(session.data.userId);
  return { user };
});

export const serverLogout = createServerFn({ method: "POST" }).handler(async () => {
  await clearSession({
    password: process.env.SESSION_SECRET || "sadova-dev-session-secret-change-in-production-32",
    name: "sadova-session",
  });
  return { ok: true };
});