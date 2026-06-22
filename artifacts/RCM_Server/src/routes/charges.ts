import { Router } from "express";
import { db } from "@workspace/db";
import { chargesTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const router = Router();

router.get("/charges", async (req, res) => {
  try {
    const charges = await db.select().from(chargesTable);
    res.json(charges);
  } catch {
    res.json([]);
  }
});

router.post("/charges", async (req, res) => {
  try {
    const [charge] = await db.insert(chargesTable).values({ ...req.body, status: "pending" }).returning();
    res.status(201).json(charge);
  } catch (e) {
    req.log.error(e);
    res.status(500).json({ error: "Failed to create charge" });
  }
});

router.patch("/charges/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  try {
    const [updated] = await db.update(chargesTable).set(req.body).where(eq(chargesTable.id, id)).returning();
    res.json(updated);
  } catch {
    res.status(500).json({ error: "Failed to update charge" });
  }
});

export default router;
