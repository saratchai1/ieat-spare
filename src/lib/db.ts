import { PrismaClient } from "@prisma/client";
import { copyFileSync, existsSync } from "node:fs";
import { join } from "node:path";

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

function prepareDatabaseUrl() {
  if (process.env.VERCEL) {
    const bundledDemoDb = join(process.cwd(), "prisma", "dev.db");
    const writableDemoDb = "/tmp/ieat-spare-demo.db";

    if (existsSync(bundledDemoDb) && !existsSync(writableDemoDb)) {
      copyFileSync(bundledDemoDb, writableDemoDb);
    }

    if (existsSync(writableDemoDb)) {
      process.env.DATABASE_URL = `file:${writableDemoDb}`;
      return;
    }
  }

  if (!process.env.DATABASE_URL) {
    process.env.DATABASE_URL = "file:./dev.db";
  }
}

prepareDatabaseUrl();

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
