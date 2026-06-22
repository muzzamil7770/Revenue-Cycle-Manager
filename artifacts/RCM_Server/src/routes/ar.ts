import { Router } from "express";

const router = Router();

router.get("/ar/aging", async (_req, res) => {
  res.json({
    current: 842300,
    days30: 623100,
    days60: 412800,
    days90: 287600,
    days120plus: 198400,
    total: 2364200,
    buckets: [
      { label: "Current (0-30)", amount: 842300, percentage: 35.6, count: 312 },
      { label: "31-60 Days", amount: 623100, percentage: 26.4, count: 231 },
      { label: "61-90 Days", amount: 412800, percentage: 17.5, count: 153 },
      { label: "91-120 Days", amount: 287600, percentage: 12.2, count: 107 },
      { label: "120+ Days", amount: 198400, percentage: 8.3, count: 74 },
    ],
  });
});

router.get("/ar/worklist", async (_req, res) => {
  res.json([
    { id: 1, claimId: 1, claimNumber: "CLM-2024-8801", patientName: "James Patterson", payerName: "Blue Cross", amount: 4250, ageDays: 87, priority: "high", assignee: "Sarah Mitchell", lastAction: "Called payer - on hold", nextAction: "Follow up call", dueDate: new Date(Date.now() + 2 * 86400000).toISOString().split("T")[0] },
    { id: 2, claimId: 2, claimNumber: "CLM-2024-8756", patientName: "Maria Santos", payerName: "Aetna", amount: 7820, ageDays: 112, priority: "critical", assignee: "Kevin Park", lastAction: "Submitted additional docs", nextAction: "Escalate to supervisor", dueDate: new Date(Date.now() + 1 * 86400000).toISOString().split("T")[0] },
    { id: 3, claimId: 3, claimNumber: "CLM-2024-8743", patientName: "Robert Chen", payerName: "Medicare", amount: 3100, ageDays: 62, priority: "medium", assignee: "James Liu", lastAction: "Verified eligibility", nextAction: "Resubmit with correction", dueDate: new Date(Date.now() + 5 * 86400000).toISOString().split("T")[0] },
    { id: 4, claimId: 4, claimNumber: "CLM-2024-8721", patientName: "Linda Thompson", payerName: "United Health", amount: 9450, ageDays: 134, priority: "critical", assignee: "Sarah Mitchell", lastAction: "Appeal submitted", nextAction: "Check appeal status", dueDate: new Date(Date.now()).toISOString().split("T")[0] },
    { id: 5, claimId: 5, claimNumber: "CLM-2024-8698", patientName: "David Wilson", payerName: "Cigna", amount: 2340, ageDays: 45, priority: "low", assignee: "Rosa Nguyen", lastAction: "Initial claim submitted", nextAction: "Verify receipt", dueDate: new Date(Date.now() + 10 * 86400000).toISOString().split("T")[0] },
  ]);
});

export default router;
