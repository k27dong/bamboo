module.exports = {
  apps: [
    {
      name: "Bamboo",
      script: "dist/sharding.js",
      instances: 1,
      exec_mode: "fork",
      autorestart: true,
      max_memory_restart: "2G",
      node_args: ["--enable-source-maps", "--no-deprecation"],
      args: ["--color"],
      kill_timeout: 10000,
      wait_ready: false,
      env: {
        NODE_ENV: "development",
      },
      env_production: {
        NODE_ENV: "production",
      },
    },
  ],
}
