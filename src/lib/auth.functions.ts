import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

const signupSchema = loginSchema.extend({
  name: z.string().min(2),
  referralCode: z.string().optional(),
});

function sessionPassword() {
  const value = process.env.SESSION_SECRET;
  if (process.env.NODE_ENV === "production" && (!value || value.length < 32)) {
    throw new Error("SESSION_SECRET должен быть задан на хостинге");
  }
  return value || "sadova-dev-session-secret-change-in-production-32";
}

export const serverSignup = createServerFn({ method: "POST" })
  .inputValidator((data) => signupSchema.parse(data))
  .handler(async ({ data }) => {
    const { registerUser } = await import("./auth.server");
    const { useSession } = await import("@tanstack/react-start/server");
    const user = await registerUser(data);
    const session = await useSession<{ userId: string }>({
      password: sessionPassword(),
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
    const { useSession } = await import("@tanstack/react-start/server");
    const user = await authenticateUser(data.email, data.password);
    const session = await useSession<{ userId: string }>({
      password: sessionPassword(),
      name: "sadova-session",
      maxAge: 60 * 60 * 24 * 30,
      cookie: { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/" },
    });
    await session.update({ userId: user.id });
    return { ok: true, user };
  });

export const serverMe = createServerFn({ method: "GET" }).handler(async () => {
  const { useSession } = await import("@tanstack/react-start/server");
  const session = await useSession<{ userId?: string }>({
    password: sessionPassword(),
    name: "sadova-session",
  });
  if (!session.data.userId) return { user: null };
  const { getSafeUser } = await import("./auth.server");
  const user = await getSafeUser(session.data.userId);
  return { user };
});

export const serverLogout = createServerFn({ method: "POST" }).handler(async () => {
  const { clearSession } = await import("@tanstack/react-start/server");
  await clearSession({
    password: sessionPassword(),
    name: "sadova-session",
  });
  return { ok: true };
});