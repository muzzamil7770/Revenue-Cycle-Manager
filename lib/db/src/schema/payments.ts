import { pgTable, serial, text, numeric, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const paymentsTable = pgTable("payments", {
  id: serial("id").primaryKey(),
  claimId: integer("claim_id").notNull(),
  claimNumber: text("claim_number").notNull(),
  patientName: text("patient_name").notNull().default(""),
  payerName: text("payer_name").notNull().default(""),
  amount: numeric("amount", { precision: 10, scale: 2 }).notNull(),
  paymentDate: text("payment_date").notNull(),
  type: text("type").notNull().default("insurance"),
  method: text("method").notNull().default("eft"),
  status: text("status").notNull().default("posted"),
  postedBy: text("posted_by").notNull().default(""),
  checkNumber: text("check_number"),
  eraNumber: text("era_number"),
  adjustments: numeric("adjustments", { precision: 10, scale: 2 }).notNull().default("0"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertPaymentSchema = createInsertSchema(paymentsTable).omit({ id: true, createdAt: true });
export type InsertPayment = z.infer<typeof insertPaymentSchema>;
export type Payment = typeof paymentsTable.$inferSelect;
