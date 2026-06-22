import { pgTable, serial, text, numeric, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const payersTable = pgTable("payers", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  type: text("type").notNull(),
  npi: text("npi").notNull(),
  status: text("status").notNull().default("active"),
  claimsAddress: text("claims_address").notNull().default(""),
  phone: text("phone").notNull().default(""),
  electronicPayerId: text("electronic_payer_id").notNull().default(""),
  avgReimbursementDays: numeric("avg_reimbursement_days", { precision: 5, scale: 1 }).default("0"),
  denialRate: numeric("denial_rate", { precision: 5, scale: 2 }).default("0"),
  contractedRate: numeric("contracted_rate", { precision: 5, scale: 2 }).default("0"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertPayerSchema = createInsertSchema(payersTable).omit({ id: true, createdAt: true });
export type InsertPayer = z.infer<typeof insertPayerSchema>;
export type Payer = typeof payersTable.$inferSelect;
