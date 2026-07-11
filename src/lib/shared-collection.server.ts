import { randomUUID } from "crypto";
import mysql from "mysql2/promise";

let pool: mysql.Pool | null = null;
let appRecordTableReady = false;
const PACKED_COLLECTION_KEY = "__collection__";

function db() {
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL не задан — общие объявления не могут сохраняться в БД");
  pool ??= mysql.createPool(process.env.DATABASE_URL);
  return pool;
}

function normalizeDbError(error: unknown): Error {
  const message = error instanceof Error ? error.message : String(error);
  if (message.includes("ECONNREFUSED") || message.includes("connect")) {
    return new Error("База данных недоступна: проверьте DATABASE_URL и что MySQL запущен на сервере");
  }
  if (message.includes("Access denied")) {
    return new Error("MySQL отклонил доступ: проверьте логин и пароль в DATABASE_URL");
  }
  if (message.includes("Unknown database")) {
    return new Error("База MySQL не найдена: создайте базу и укажите её имя в DATABASE_URL");
  }
  return error instanceof Error ? error : new Error(message);
}

async function ensureAppRecordTable(client: mysql.Pool) {
  if (appRecordTableReady) return;
  await client.query(`
    CREATE TABLE IF NOT EXISTS \`AppRecord\` (
      \`id\` VARCHAR(191) NOT NULL,
      \`collection\` VARCHAR(191) NOT NULL,
      \`recordKey\` VARCHAR(191) NOT NULL,
      \`value\` JSON NOT NULL,
      \`createdAt\` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
      \`updatedAt\` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
      PRIMARY KEY (\`id\`),
      UNIQUE KEY \`AppRecord_collection_recordKey_key\` (\`collection\`, \`recordKey\`),
      KEY \`AppRecord_collection_idx\` (\`collection\`)
    ) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci
  `);
  appRecordTableReady = true;
}

function parseJson<T>(value: unknown): T {
  if (typeof value === "string") {
    try {
      return JSON.parse(value) as T;
    } catch {
      return value as T;
    }
  }
  return value as T;
}

export async function readCollection<T = unknown>(name: string): Promise<T[]> {
  let rows: Array<mysql.RowDataPacket & { recordKey: string; value: unknown }>;
  try {
    const client = db();
    await ensureAppRecordTable(client);
    [rows] = await client.query<Array<mysql.RowDataPacket & { recordKey: string; value: unknown }>>(
      "SELECT `recordKey`, `value` FROM `AppRecord` WHERE `collection` = ? ORDER BY `createdAt` ASC",
      [name],
    );
  } catch (error) {
    throw normalizeDbError(error);
  }
  const packed = rows.find((row) => row.recordKey === PACKED_COLLECTION_KEY);
  if (packed) {
    const value = parseJson<unknown>(packed.value);
    return Array.isArray(value) ? (value as T[]) : [];
  }
  return rows.map((row) => parseJson<T>(row.value));
}

export async function writeCollection<T = unknown>(name: string, items: T[]): Promise<void> {
  const client = db();
  let connection: mysql.PoolConnection | null = null;
  try {
    await ensureAppRecordTable(client);
    const payload = JSON.stringify(items);
    connection = await client.getConnection();
    await connection.beginTransaction();
    await connection.query("DELETE FROM `AppRecord` WHERE `collection` = ?", [name]);
    await connection.query(
      "INSERT INTO `AppRecord` (`id`, `collection`, `recordKey`, `value`, `createdAt`, `updatedAt`) VALUES (?, ?, ?, ?, NOW(3), NOW(3))",
      [randomUUID(), name, PACKED_COLLECTION_KEY, payload],
    );
    await connection.commit();
  } catch (error) {
    if (connection) await connection.rollback();
    throw normalizeDbError(error);
  } finally {
    connection?.release();
  }
}