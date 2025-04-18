
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { assets, users, compliance, transactions, regulatoryUpdates } from "@shared/schema";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is required");
}

// Create postgres client
const client = postgres(process.env.DATABASE_URL);

// Create drizzle database instance
export const db = drizzle(client, {
  schema: {
    assets,
    users,
    compliance,
    transactions,
    regulatoryUpdates
  }
});
