import { pgTable, serial, text, numeric, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const chargesTable = pgTable("charges", {
  id: serial("id").primaryKey(),
  patientId: integer("patient_id").notNull(),
  patientName: text("patient_name").notNull().default(""),
  serviceDate: text("service_date").notNull(),
  cptCode: text("cpt_code").notNull(),
  icdCode: text("icd_code").notNull(),
  description: text("description").notNull().default(""),
  amount: numeric("amount", { precision: 10, scale: 2 }).notNull(),
  status: text("status").notNull().default("pending"),
  providerId: integer("provider_id").notNull().default(1),
  providerName: text("provider_name").notNull().default(""),
  modifier: text("modifier"),
  units: integer("units").notNull().default(1),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertChargeSchema = createInsertSchema(chargesTable).omit({ id: true, createdAt: true });
export type InsertCharge = z.infer<typeof insertChargeSchema>;
export type Charge = typeof chargesTable.$inferSelect;
