import { Router } from "express";
import { db } from "@workspace/db";
import { patientsTable } from "@workspace/db";
import { eq, like, or, sql } from "drizzle-orm";

const router = Router();

router.get("/patients", async (req, res) => {
  const { search, status, page = "1", limit = "20" } = req.query as Record<string, string>;
  const pageNum = Math.max(1, parseInt(page));
  const limitNum = Math.min(100, parseInt(limit));
  const offset = (pageNum - 1) * limitNum;

  try {
    let query = db.select().from(patientsTable);
    let countQuery = db.select({ count: sql<number>`count(*)` }).from(patientsTable);

    const conditions = [];
    if (status) conditions.push(eq(patientsTable.status, status));
    if (search) {
      conditions.push(or(
        like(patientsTable.firstName, `%${search}%`),
        like(patientsTable.lastName, `%${search}%`),
        like(patientsTable.mrn, `%${search}%`),
        like(patientsTable.email, `%${search}%`),
      ));
    }

    const data = await query.limit(limitNum).offset(offset);
    const [{ count }] = await countQuery;

    res.json({ data, total: Number(count), page: pageNum, limit: limitNum });
  } catch {
    res.json({ data: [], total: 0, page: pageNum, limit: limitNum });
  }
});

router.post("/patients", async (req, res) => {
  const { firstName, lastName, dob, primaryInsurance, phone, email, address = "", city = "", state = "", zip = "", provider = "" } = req.body;
  const mrn = `MRN-${String(Math.floor(Math.random() * 90000) + 10000)}`;
  try {
    const [patient] = await db.insert(patientsTable).values({
      firstName, lastName, dob, mrn, status: "active",
      primaryInsurance, phone, email, address, city, state, zip, provider, balance: "0",
    }).returning();
    res.status(201).json(patient);
  } catch (e) {
    req.log.error(e);
    res.status(500).json({ error: "Failed to create patient" });
  }
});

router.get("/patients/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  try {
    const [patient] = await db.select().from(patientsTable).where(eq(patientsTable.id, id));
    if (!patient) return res.status(404).json({ error: "Not found" });
    res.json(patient);
  } catch {
    res.status(500).json({ error: "Failed to fetch patient" });
  }
});

router.patch("/patients/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  try {
    const [updated] = await db.update(patientsTable).set(req.body).where(eq(patientsTable.id, id)).returning();
    res.json(updated);
  } catch {
    res.status(500).json({ error: "Failed to update patient" });
  }
});

router.get("/patients/:id/eligibility", async (req, res) => {
  const id = parseInt(req.params.id);
  try {
    const [patient] = await db.select().from(patientsTable).where(eq(patientsTable.id, id));
    res.json({
      patientId: id,
      eligible: true,
      payer: patient?.primaryInsurance ?? "Blue Cross Blue Shield",
      planName: "PPO Gold 80",
      memberId: `MEM-${id}${Math.floor(Math.random() * 9000) + 1000}`,
      groupId: `GRP-${Math.floor(Math.random() * 90000) + 10000}`,
      copay: 30,
      deductible: 2000,
      deductibleMet: 1450,
      outOfPocketMax: 6000,
      outOfPocketMet: 2100,
      checkedAt: new Date().toISOString(),
    });
  } catch {
    res.status(500).json({ error: "Failed to check eligibility" });
  }
});

export default router;
