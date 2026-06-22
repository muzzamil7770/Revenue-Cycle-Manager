import { pgTable, serial, text, numeric, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const claimsTable = pgTable("claims", {
  id: serial("id").primaryKey(),
  claimNumber: text("claim_number").notNull().unique(),
  patientId: integer("patient_id").notNull(),
  patientName: text("patient_name").notNull().default(""),
  payerId: integer("payer_id").notNull(),
  payerName: text("payer_name").notNull().default(""),
  serviceDate: text("service_date").notNull(),
  submittedDate: text("submitted_date").notNull().default(""),
  totalCharge: numeric("total_charge", { precision: 10, scale: 2 }).notNull(),
  allowedAmount: numeric("allowed_amount", { precision: 10, scale: 2 }).notNull().default("0"),
  paidAmount: numeric("paid_amount", { precision: 10, scale: 2 }).notNull().default("0"),
  adjustmentAmount: numeric("adjustment_amount", { precision: 10, scale: 2 }).notNull().default("0"),
  patientBalance: numeric("patient_balance", { precision: 10, scale: 2 }).notNull().default("0"),
  status: text("status").notNull().default("pending"),
  claimType: text("claim_type").notNull().default("professional"),
  providerId: integer("provider_id").notNull().default(1),
  providerName: text("provider_name").notNull().default(""),
  diagnosisCodes: text("diagnosis_codes").notNull().default("[]"),
  procedureCodes: text("procedure_codes").notNull().default("[]"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertClaimSchema = createInsertSchema(claimsTable).omit({ id: true, createdAt: true, claimNumber: true });
export type InsertClaim = z.infer<typeof insertClaimSchema>;
export type Claim = typeof claimsTable.$inferSelect;
