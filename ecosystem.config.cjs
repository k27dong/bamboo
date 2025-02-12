module.exports = {
  apps: [
    {
      name: "Bamboo",
      script: "dist/Bamboo.js",
      instances: 1,
      autorestart: true,
      max_memory_restart: "2G",
      node_args: ["--enable-source-maps", "--no-deprecation"],
      env: {
        NODE_ENV: "development",
      },
      env_production: {
        NODE_ENV: "production",
      },
    },
  ],
}
