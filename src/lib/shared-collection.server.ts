import { PrismaClient } from "@prisma/client";

let prisma: PrismaClient | null = null;

function db() {
  if (!process.env.DATABASE_URL) return null;
  prisma ??= new PrismaClient();
  return prisma as PrismaClient & {
    appRecord?: {
      findMany: (args: unknown) => Promise<Array<{ value: unknown; createdAt: Date }>>;
      deleteMany: (args: unknown) => Promise<unknown>;
      createMany: (args: unknown) => Promise<unknown>;
    };
  };
}

function keyFor(item: unknown, index: number) {
  if (item && typeof item === "object") {
    const rec = item as { id?: unknown; key?: unknown; slug?: unknown };
    const k = rec.id ?? rec.key ?? rec.slug;
    if (typeof k === "string" && k.trim()) return k;
  }
  return `row-${String(index).padStart(6, "0")}`;
}

export async function readCollection<T = unknown>(name: string): Promise<T[]> {
  const client = db();
  if (!client?.appRecord) return [];
  const rows = await client.appRecord.findMany({
    where: { collection: name },
    orderBy: { createdAt: "asc" },
  });
  return rows.map((row) => row.value as T);
}

export async function writeCollection<T = unknown>(name: string, items: T[]): Promise<void> {
  const client = db();
  if (!client?.appRecord) return;
  await client.$transaction(async (tx) => {
    const record = (tx as typeof client).appRecord;
    if (!record) return;
    await record.deleteMany({ where: { collection: name } });
    if (items.length) {
      await record.createMany({
        data: items.map((item, index) => ({
          collection: name,
          recordKey: keyFor(item, index),
          value: item as object,
        })),
      });
    }
  });
}