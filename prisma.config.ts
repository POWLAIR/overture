import { defineConfig, env } from "prisma/config";
import { loadEnvConfig } from "@next/env";

// Prisma CLI ne charge pas .env.local automatiquement — on le charge via @next/env
loadEnvConfig(process.cwd());

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url: env("DATABASE_URL"),
  },
});
