import { Router } from "express";
import { db } from "@workspace/db";
import { statementsTable, paymentPlansTable } from "@workspace/db";

const router = Router();

router.get("/billing/statements", async (_req, res) => {
  try {
    const statements = await db.select().from(statementsTable);
    res.json(statements);
  } catch {
    res.json([]);
  }
});

router.get("/billing/payment-plans", async (_req, res) => {
  try {
    const plans = await db.select().from(paymentPlansTable);
    res.json(plans);
  } catch {
    res.json([]);
  }
});

router.post("/billing/payment-plans", async (req, res) => {
  const { patientId, totalAmount, monthlyAmount, startDate } = req.body;
  const totalInstallments = Math.ceil(totalAmount / monthlyAmount);
  try {
    const [plan] = await db.insert(paymentPlansTable).values({
      patientId,
      patientName: "",
      totalAmount: String(totalAmount),
      monthlyAmount: String(monthlyAmount),
      remainingBalance: String(totalAmount),
      startDate,
      status: "active",
      installmentsPaid: 0,
      totalInstallments,
    }).returning();
    res.status(201).json(plan);
  } catch (e) {
    req.log.error(e);
    res.status(500).json({ error: "Failed to create payment plan" });
  }
});

export default router;
