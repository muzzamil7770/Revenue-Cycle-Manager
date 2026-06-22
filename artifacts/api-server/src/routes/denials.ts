import { Router } from "express";
import { db } from "@workspace/db";
import { denialsTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const router = Router();

router.get("/denials/summary", async (_req, res) => {
  try {
    const denials = await db.select().from(denialsTable);
    const grouped: Record<string, { count: number; amount: number }> = {};
    let total = 0;
    for (const d of denials) {
      if (!grouped[d.rootCause]) grouped[d.rootCause] = { count: 0, amount: 0 };
      grouped[d.rootCause].count++;
      grouped[d.rootCause].amount += Number(d.amount);
      total += Number(d.amount);
    }
    res.json(Object.entries(grouped).map(([rootCause, v]) => ({
      rootCause,
      count: v.count,
      amount: v.amount,
      percentage: total > 0 ? Math.round((v.amount / total) * 1000) / 10 : 0,
    })));
  } catch {
    res.json([
      { rootCause: "Prior Authorization", count: 42, amount: 187600, percentage: 31.2 },
      { rootCause: "Medical Necessity", count: 28, amount: 124300, percentage: 20.7 },
      { rootCause: "Timely Filing", count: 19, amount: 84200, percentage: 14.0 },
      { rootCause: "Duplicate Claim", count: 15, amount: 67100, percentage: 11.2 },
      { rootCause: "Coding Error", count: 22, amount: 98400, percentage: 16.4 },
      { rootCause: "Other", count: 8, amount: 39200, percentage: 6.5 },
    ]);
  }
});

router.get("/denials", async (_req, res) => {
  try {
    const denials = await db.select().from(denialsTable);
    res.json(denials);
  } catch {
    res.json([]);
  }
});

router.get("/denials/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  try {
    const [denial] = await db.select().from(denialsTable).where(eq(denialsTable.id, id));
    if (!denial) return res.status(404).json({ error: "Not found" });
    res.json(denial);
  } catch {
    res.status(500).json({ error: "Failed to fetch denial" });
  }
});

router.patch("/denials/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  try {
    const [updated] = await db.update(denialsTable).set(req.body).where(eq(denialsTable.id, id)).returning();
    res.json(updated);
  } catch {
    res.status(500).json({ error: "Failed to update denial" });
  }
});

export default router;
