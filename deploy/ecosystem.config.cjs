// PM2 конфиг: pm2 start deploy/ecosystem.config.cjs --env production
module.exports = {
  apps: [
    {
      name: "sadova",
      cwd: "/var/www/sadova",
      script: "bun",
      args: "run start",
      instances: 1,
      exec_mode: "fork",
      max_memory_restart: "512M",
      env: { NODE_ENV: "production", PORT: 3000 },
      error_file: "/var/log/sadova/err.log",
      out_file: "/var/log/sadova/out.log",
      time: true,
    },
  ],
};