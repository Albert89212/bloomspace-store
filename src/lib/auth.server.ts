import { createHash, randomBytes, timingSafeEqual } from "crypto";
import { PrismaClient } from "@prisma/client";

export type SafeUserDto = {
  id: string;
  name: string;
  email: string;
  role: "owner" | "admin" | "moderator" | "support" | "orders" | "customer" | "dealer";
  referralCode: string;
  referredBy?: string;
  bonusBalance: number;
  createdAt: number;
  emailVerified: boolean;
  invitedCount: number;
};

let prisma: PrismaClient | null = null;

type Db = PrismaClient & { user: any };

type RawUser = {
  id: string;
  email: string;
  name: string | null;
  role: string;
  referralCode?: string | null;
  referredBy?: string | null;
  bonusBalance?: number | null;
  createdAt: Date;
  emailVerified?: boolean | null;
  passwordHash?: string;
};

function db() {
  if (!process.env.DATABASE_URL) return null;
  prisma ??= new PrismaClient();
  return prisma as Db;
}

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function referralCode(len = 6) {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  return Array.from({ length: len }, () => alphabet[Math.floor(Math.random() * alphabet.length)]).join("");
}

function hashPassword(password: string, salt = randomBytes(16).toString("hex")) {
  const hash = createHash("sha256").update(`${salt}:${password}`).digest("hex");
  return `${salt}:${hash}`;
}

function verifyPassword(password: string, stored: string) {
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) return false;
  const candidate = hashPassword(password, salt).split(":")[1];
  return timingSafeEqual(Buffer.from(hash), Buffer.from(candidate));
}

function mapRole(role: string): SafeUserDto["role"] {
  if (role === "OWNER") return "owner";
  if (role === "ADMIN") return "admin";
  if (role === "MODERATOR") return "moderator";
  if (role === "SUPPORT") return "support";
  if (role === "ORDERS") return "orders";
  return "customer";
}

async function toSafeUser(user: RawUser): Promise<SafeUserDto> {
  const client = db();
  const code = user.referralCode || "";
  const invitedCount = client && code
    ? await client.user.count({ where: { referredBy: code } })
    : 0;
  return {
    id: user.id,
    name: user.name || user.email.split("@")[0],
    email: user.email,
    role: mapRole(user.role),
    referralCode: code,
    referredBy: user.referredBy || undefined,
    bonusBalance: Math.round((user.bonusBalance ?? 0) / 100),
    createdAt: user.createdAt.getTime(),
    emailVerified: Boolean(user.emailVerified ?? true),
    invitedCount,
  };
}

async function ensureOwner() {
  const client = db();
  if (!client) return null;
  const email = normalizeEmail(process.env.OWNER_EMAIL || "owner@sadova.ru");
  const password = process.env.OWNER_PASSWORD || "owner123";
  const existing = await client.user.findUnique({ where: { email } });
  if (existing) return existing;
  return client.user.create({
    data: {
      email,
      name: "Альберт Тогашев",
      passwordHash: hashPassword(password),
      role: "OWNER",
      referralCode: "OWNER1",
      bonusBalance: 0,
      emailVerified: true,
    },
  });
}

export async function registerUser(data: { name: string; email: string; password: string; referralCode?: string }) {
  const client = db();
  if (!client) throw new Error("База данных не подключена");
  await ensureOwner();
  const email = normalizeEmail(data.email);
  const exists = await client.user.findUnique({ where: { email } });
  if (exists) throw new Error("Email уже зарегистрирован");
  const referrer = data.referralCode
    ? await client.user.findFirst({ where: { referralCode: data.referralCode.trim().toUpperCase() } })
    : null;
  const user = await client.$transaction(async (tx) => {
    if (referrer) {
      await tx.user.update({
        where: { id: referrer.id },
        data: { bonusBalance: { increment: 100_000 } },
      });
    }
    let code = referralCode();
    for (let i = 0; i < 5; i += 1) {
      const taken = await tx.user.findUnique({ where: { referralCode: code } });
      if (!taken) break;
      code = referralCode();
    }
    return tx.user.create({
      data: {
        email,
        name: data.name.trim(),
        passwordHash: hashPassword(data.password),
        role: "USER",
        referralCode: code,
        referredBy: referrer?.referralCode,
        bonusBalance: referrer ? 50_000 : 0,
        emailVerified: true,
      },
    });
  });
  return toSafeUser(user);
}

export async function authenticateUser(emailInput: string, password: string) {
  const client = db();
  if (!client) throw new Error("База данных не подключена");
  await ensureOwner();
  const user = await client.user.findUnique({ where: { email: normalizeEmail(emailInput) } });
  if (!user || !verifyPassword(password, user.passwordHash)) throw new Error("Неверный email или пароль");
  return toSafeUser(user);
}

export async function getSafeUser(userId: string) {
  const client = db();
  if (!client) return null;
  const user = await client.user.findUnique({ where: { id: userId } });
  return user ? toSafeUser(user) : null;
}