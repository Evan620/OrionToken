import { pgTable, text, serial, integer, boolean, jsonb, timestamp, real, uniqueIndex } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User schema
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull().unique(),
  fullName: text("full_name").notNull(),
  company: text("company"),
  plan: text("plan").default("Starter").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull()
});

// Asset types enum
export const AssetType = {
  REAL_ESTATE: "real_estate",
  INVOICE: "invoice",
  EQUIPMENT: "equipment"
} as const;

export type AssetType = typeof AssetType[keyof typeof AssetType];

// Asset status enum
export const AssetStatus = {
  DRAFT: "draft",
  PENDING: "pending",
  ACTIVE: "active",
  COMPLIANCE_ISSUE: "compliance_issue"
} as const;

export type AssetStatus = typeof AssetStatus[keyof typeof AssetStatus];

// Blockchain enum
export const Blockchain = {
  ETHEREUM: "ethereum",
  POLYGON: "polygon"
} as const;

export type Blockchain = typeof Blockchain[keyof typeof Blockchain];

// Asset schema
export const assets = pgTable("assets", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  userId: integer("user_id").notNull().references(() => users.id),
  type: text("type").notNull(), // Using AssetType
  subtype: text("subtype"), // E.g., commercial/residential for real estate
  description: text("description"),
  location: text("location"), // For real estate
  company: text("company"), // For invoices
  value: real("value").notNull(), // Asset value in USD
  tokenized: real("tokenized").default(0).notNull(), // Percentage tokenized
  tokenizedValue: real("tokenized_value").default(0).notNull(), // Value tokenized in USD
  liquidity: text("liquidity").default("low"), // high, medium, low
  blockchain: text("blockchain").notNull(), // Using Blockchain
  status: text("status").default("draft").notNull(), // Using AssetStatus
  ipfsHash: text("ipfs_hash"), // IPFS hash for documents
  contractAddress: text("contract_address"), // Blockchain contract address
  metadata: jsonb("metadata"), // Additional asset-specific data
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
});

// Compliance schema
export const compliance = pgTable("compliance", {
  id: serial("id").primaryKey(),
  assetId: integer("asset_id").notNull().references(() => assets.id),
  jurisdiction: text("jurisdiction").notNull(), // EU, US, Asia, etc.
  kycRequired: boolean("kyc_required").default(true).notNull(),
  kycCompleted: boolean("kyc_completed").default(false).notNull(),
  templateUsed: text("template_used"), // Legal template reference
  regulatoryNotes: text("regulatory_notes"),
  complianceScore: integer("compliance_score").default(0), // 0-100
  updatedAt: timestamp("updated_at")
});

// Transaction schema for marketplace activity
export const transactions = pgTable("transactions", {
  id: serial("id").primaryKey(),
  assetId: integer("asset_id").notNull().references(() => assets.id),
  buyerId: integer("buyer_id").references(() => users.id),
  sellerId: integer("seller_id").references(() => users.id),
  tokenAmount: real("token_amount").notNull(),
  valueAmount: real("value_amount").notNull(), // USD value
  transactionType: text("transaction_type").notNull(), // offer, sale, purchase, listing
  status: text("status").notNull(), // pending, completed, cancelled
  transactionHash: text("transaction_hash"), // Blockchain transaction hash
  createdAt: timestamp("created_at").defaultNow().notNull()
});

// Regulatory updates/alerts
export const regulatoryUpdates = pgTable("regulatory_updates", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  jurisdiction: text("jurisdiction").notNull(),
  severity: text("severity").notNull(), // info, warning, critical
  assetTypesAffected: text("asset_types_affected").array(), // Array of AssetType
  actionRequired: boolean("action_required").default(false).notNull(),
  actionDescription: text("action_description"),
  publishDate: timestamp("publish_date").defaultNow().notNull(),
  expiryDate: timestamp("expiry_date") // Optional expiry date
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  email: true,
  fullName: true,
  company: true,
  plan: true
});

export const insertAssetSchema = createInsertSchema(assets).pick({
  name: true,
  userId: true,
  type: true,
  subtype: true,
  description: true,
  location: true,
  company: true,
  value: true,
  tokenized: true,
  tokenizedValue: true,
  liquidity: true,
  blockchain: true,
  status: true,
  ipfsHash: true,
  contractAddress: true,
  metadata: true
});

export const insertComplianceSchema = createInsertSchema(compliance).pick({
  assetId: true,
  jurisdiction: true,
  kycRequired: true,
  kycCompleted: true,
  templateUsed: true,
  regulatoryNotes: true,
  complianceScore: true
});

export const insertTransactionSchema = createInsertSchema(transactions).pick({
  assetId: true,
  buyerId: true,
  sellerId: true,
  tokenAmount: true,
  valueAmount: true,
  transactionType: true,
  status: true,
  transactionHash: true
});

export const insertRegulatoryUpdateSchema = createInsertSchema(regulatoryUpdates).pick({
  title: true,
  description: true,
  jurisdiction: true,
  severity: true,
  assetTypesAffected: true,
  actionRequired: true,
  actionDescription: true,
  publishDate: true,
  expiryDate: true
});

// Export types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertAsset = z.infer<typeof insertAssetSchema>;
export type Asset = typeof assets.$inferSelect;

export type InsertCompliance = z.infer<typeof insertComplianceSchema>;
export type Compliance = typeof compliance.$inferSelect;

export type InsertTransaction = z.infer<typeof insertTransactionSchema>;
export type Transaction = typeof transactions.$inferSelect;

export type InsertRegulatoryUpdate = z.infer<typeof insertRegulatoryUpdateSchema>;
export type RegulatoryUpdate = typeof regulatoryUpdates.$inferSelect;
