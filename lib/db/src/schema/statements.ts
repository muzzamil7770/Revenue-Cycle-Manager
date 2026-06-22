import { pgTable, serial, text, numeric, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const statementsTable = pgTable("statements", {
  id: serial("id").primaryKey(),
  patientId: integer("patient_id").notNull(),
  patientName: text("patient_name").notNull().default(""),
  statementDate: text("statement_date").notNull(),
  dueDate: text("due_date").notNull(),
  totalAmount: numeric("total_amount", { precision: 10, scale: 2 }).notNull(),
  paidAmount: numeric("paid_amount", { precision: 10, scale: 2 }).notNull().default("0"),
  balance: numeric("balance", { precision: 10, scale: 2 }).notNull(),
  status: text("status").notNull().default("outstanding"),
  email: text("email"),
  lastReminderSent: text("last_reminder_sent"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const paymentPlansTable = pgTable("payment_plans", {
  id: serial("id").primaryKey(),
  patientId: integer("patient_id").notNull(),
  patientName: text("patient_name").notNull().default(""),
  totalAmount: numeric("total_amount", { precision: 10, scale: 2 }).notNull(),
  monthlyAmount: numeric("monthly_amount", { precision: 10, scale: 2 }).notNull(),
  remainingBalance: numeric("remaining_balance", { precision: 10, scale: 2 }).notNull(),
  startDate: text("start_date").notNull(),
  status: text("status").notNull().default("active"),
  installmentsPaid: integer("installments_paid").notNull().default(0),
  totalInstallments: integer("total_installments").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertStatementSchema = createInsertSchema(statementsTable).omit({ id: true, createdAt: true });
export type InsertStatement = z.infer<typeof insertStatementSchema>;
export type Statement = typeof statementsTable.$inferSelect;

export const insertPaymentPlanSchema = createInsertSchema(paymentPlansTable).omit({ id: true, createdAt: true });
export type InsertPaymentPlan = z.infer<typeof insertPaymentPlanSchema>;
export type PaymentPlan = typeof paymentPlansTable.$inferSelect;
