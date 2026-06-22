import { Router } from "express";
import { db } from "@workspace/db";
import { usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const router = Router();

router.get("/users", async (_req, res) => {
  try {
    const users = await db.select().from(usersTable);
    res.json(users.map(u => ({ ...u, permissions: JSON.parse(u.permissions) })));
  } catch {
    res.json([]);
  }
});

router.post("/users", async (req, res) => {
  try {
    const { permissions = [], ...rest } = req.body;
    const [user] = await db.insert(usersTable).values({
      ...rest,
      permissions: JSON.stringify(permissions),
      lastLogin: new Date().toISOString(),
    }).returning();
    res.status(201).json({ ...user, permissions: JSON.parse(user.permissions) });
  } catch (e) {
    req.log.error(e);
    res.status(500).json({ error: "Failed to create user" });
  }
});

router.patch("/users/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  try {
    const { permissions, ...rest } = req.body;
    const updateData = { ...rest };
    if (permissions !== undefined) updateData.permissions = JSON.stringify(permissions);
    const [updated] = await db.update(usersTable).set(updateData).where(eq(usersTable.id, id)).returning();
    res.json({ ...updated, permissions: JSON.parse(updated.permissions) });
  } catch {
    res.status(500).json({ error: "Failed to update user" });
  }
});

router.delete("/users/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  try {
    await db.delete(usersTable).where(eq(usersTable.id, id));
    res.status(204).end();
  } catch {
    res.status(500).json({ error: "Failed to delete user" });
  }
});

export default router;
