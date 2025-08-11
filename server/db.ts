import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

neonConfig.webSocketConstructor = ws;

if (!process.env.DATABASE_URL) {
  console.log("⚠️  No DATABASE_URL set - running in demo mode with in-memory data");
  console.log("   To persist data, set DATABASE_URL in your .env file");
  // Use a simple SQLite in-memory database for demo
  process.env.DATABASE_URL = "sqlite://:memory:";
}

export const pool = new Pool({ connectionString: process.env.DATABASE_URL });
export const db = drizzle(pool, { schema });