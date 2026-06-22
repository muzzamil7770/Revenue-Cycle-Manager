import { pgTable, serial, text, numeric, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const denialsTable = pgTable("denials", {
  id: serial("id").primaryKey(),
  claimId: integer("claim_id").notNull(),
  claimNumber: text("claim_number").notNull(),
  patientName: text("patient_name").notNull().default(""),
  payerName: text("payer_name").notNull().default(""),
  denialDate: text("denial_date").notNull(),
  denialReason: text("denial_reason").notNull(),
  rootCause: text("root_cause").notNull(),
  amount: numeric("amount", { precision: 10, scale: 2 }).notNull(),
  status: text("status").notNull().default("open"),
  daysToAppeal: integer("days_to_appeal").notNull().default(30),
  appealDate: text("appeal_date"),
  appealNotes: text("appeal_notes"),
  resolvedDate: text("resolved_date"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertDenialSchema = createInsertSchema(denialsTable).omit({ id: true, createdAt: true });
export type InsertDenial = z.infer<typeof insertDenialSchema>;
export type Denial = typeof denialsTable.$inferSelect;
