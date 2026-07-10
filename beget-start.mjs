import http from "node:http";

const port = Number(process.env.PORT || process.env.NITRO_PORT || 3000);
const host = process.env.HOST || process.env.NITRO_HOST || "127.0.0.1";

globalThis.__srvxLoader__ = ({ server }) => {
  const nodeServer = http.createServer(server.node.handler);

  nodeServer.on("error", (error) => {
    console.error("Server failed to start:", error);
    process.exit(1);
  });

  nodeServer.listen(port, host, () => {
    console.log(`Listening on http://${host}:${port}`);
  });
};

await import("./.output/server/index.mjs");