import path from "node:path";
import { defineConfig } from "prisma/config";

try {
  process.loadEnvFile(path.join(process.cwd(), ".env.local"));
} catch {
  // No .env.local (e.g. CI / Vercel) — fall through to platform-provided env.
}

export default defineConfig({
  schema: path.join("prisma", "schema.prisma"),
  migrations: {
    path: path.join("prisma", "migrations"),
    seed: "tsx prisma/seed.ts",
  },
});
