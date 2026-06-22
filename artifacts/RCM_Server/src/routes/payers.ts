import { Router } from "express";
import { db } from "@workspace/db";
import { payersTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const router = Router();

router.get("/payers", async (_req, res) => {
  try {
    const payers = await db.select().from(payersTable);
    res.json(payers);
  } catch {
    res.json([]);
  }
});

router.post("/payers", async (req, res) => {
  try {
    const [payer] = await db.insert(payersTable).values({ ...req.body, status: "active" }).returning();
    res.status(201).json(payer);
  } catch (e) {
    req.log.error(e);
    res.status(500).json({ error: "Failed to create payer" });
  }
});

router.get("/payers/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  try {
    const [payer] = await db.select().from(payersTable).where(eq(payersTable.id, id));
    if (!payer) return res.status(404).json({ error: "Not found" });
    res.json(payer);
  } catch {
    res.status(500).json({ error: "Failed to fetch payer" });
  }
});

router.patch("/payers/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  try {
    const [updated] = await db.update(payersTable).set(req.body).where(eq(payersTable.id, id)).returning();
    res.json(updated);
  } catch {
    res.status(500).json({ error: "Failed to update payer" });
  }
});

export default router;
