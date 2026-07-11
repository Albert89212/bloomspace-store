import http from "node:http";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const envPath = resolve(".env");

if (existsSync(envPath)) {
  const envFile = readFileSync(envPath, "utf8");

  for (const rawLine of envFile.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;

    const separatorIndex = line.indexOf("=");
    if (separatorIndex === -1) continue;

    const key = line.slice(0, separatorIndex).trim();
    let value = line.slice(separatorIndex + 1).trim();

    if (!key || process.env[key] !== undefined) continue;

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    process.env[key] = value;
  }
}

const port = Number(process.env.PORT || process.env.NITRO_PORT || 3000);
const host = process.env.HOST || process.env.NITRO_HOST || "127.0.0.1";
const serverPath = resolve("./.output/server/index.mjs");

if (!existsSync(serverPath)) {
  console.error(`❌ Серверный бандл не найден: ${serverPath}`);
  console.error("Сначала выполните: npm run build");
  process.exit(1);
}

globalThis.__srvxLoader__ = ({ server }) => {
  const nodeServer = http.createServer(server.node.handler);

  nodeServer.on("error", (error) => {
    console.error("Server failed to start:", error);
    process.exit(1);
  });

  nodeServer.listen(port, host, () => {
    console.log(`✅ SADOVA server listening on http://${host}:${port}`);
  });
};

await import(serverPath).catch((error) => {
  console.error("❌ Не удалось запустить серверный бандл:", error);
  process.exit(1);
});
