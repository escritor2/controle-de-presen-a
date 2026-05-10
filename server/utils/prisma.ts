// server/utils/prisma.ts
import "dotenv/config"
import { PrismaClient } from "@prisma/client"
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3"
import { PrismaPg } from "@prisma/adapter-pg"

const db = process.env.DATABASE_URL!

const adapter = db.startsWith("file:")
  ? new PrismaBetterSqlite3({ url: db })
  : new PrismaPg({ connectionString: db })

export const prisma = new PrismaClient({ adapter })