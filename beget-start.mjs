import http from "node:http";
import { existsSync } from "node:fs";
import { resolve } from "node:path";

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
