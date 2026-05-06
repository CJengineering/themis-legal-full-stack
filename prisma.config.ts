// Prisma configuration for Themis Legal
import { config } from "dotenv";
import { defineConfig } from "prisma/config";
import { resolve } from "path";

// Load environment variables from .env.local (git-ignored)
// This is for CLI commands like `prisma migrate` which run outside Next.js
config({ path: resolve(process.cwd(), ".env.local") });

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: process.env.DATABASE_URL || "",
  },
});
