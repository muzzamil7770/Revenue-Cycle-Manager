import { Router } from "express";

const router = Router();

const ICD_CODES = [
  { code: "I10", type: "ICD-10", description: "Essential (primary) hypertension", confidence: 0.95, billable: true },
  { code: "I25.10", type: "ICD-10", description: "Atherosclerotic heart disease of native coronary artery without angina pectoris", confidence: 0.88, billable: true },
  { code: "E11.9", type: "ICD-10", description: "Type 2 diabetes mellitus without complications", confidence: 0.92, billable: true },
  { code: "J18.9", type: "ICD-10", description: "Unspecified pneumonia", confidence: 0.85, billable: true },
  { code: "K92.1", type: "ICD-10", description: "Melena", confidence: 0.79, billable: true },
  { code: "N18.3", type: "ICD-10", description: "Chronic kidney disease, stage 3", confidence: 0.91, billable: true },
  { code: "M54.5", type: "ICD-10", description: "Low back pain", confidence: 0.87, billable: true },
  { code: "Z87.39", type: "ICD-10", description: "Personal history of other endocrine, nutritional and metabolic diseases", confidence: 0.76, billable: true },
];

const CPT_CODES = [
  { code: "99213", type: "CPT", description: "Office/outpatient visit, est. patient, low complexity", confidence: 0.93, billable: true },
  { code: "99214", type: "CPT", description: "Office/outpatient visit, est. patient, moderate complexity", confidence: 0.88, billable: true },
  { code: "99215", type: "CPT", description: "Office/outpatient visit, est. patient, high complexity", confidence: 0.82, billable: true },
  { code: "93000", type: "CPT", description: "Electrocardiogram, routine ECG with at least 12 leads", confidence: 0.96, billable: true },
  { code: "71046", type: "CPT", description: "Radiologic examination, chest; 2 views", confidence: 0.94, billable: true },
  { code: "80053", type: "CPT", description: "Comprehensive metabolic panel", confidence: 0.91, billable: true },
  { code: "36415", type: "CPT", description: "Collection of venous blood by venipuncture", confidence: 0.98, billable: true },
  { code: "27447", type: "CPT", description: "Arthroplasty, knee, condyle and plateau; medial and lateral compartments", confidence: 0.89, billable: true },
];

router.get("/coding/suggestions", async (req, res) => {
  const { query = "", type = "all" } = req.query as Record<string, string>;
  const q = query.toLowerCase();
  let pool = type === "icd" ? ICD_CODES : type === "cpt" ? CPT_CODES : [...ICD_CODES, ...CPT_CODES];
  if (q) {
    pool = pool.filter(c =>
      c.code.toLowerCase().includes(q) ||
      c.description.toLowerCase().includes(q)
    );
  }
  res.json(pool.slice(0, 10));
});

router.get("/coding/audits", async (_req, res) => {
  res.json([
    { id: 1, claimId: 12, claimNumber: "CLM-2024-8801", patientName: "James Patterson", flag: "Upcoding Risk", severity: "high", description: "99215 billed but documentation supports 99214", status: "open", createdAt: new Date(Date.now() - 2 * 86400000).toISOString() },
    { id: 2, claimId: 18, claimNumber: "CLM-2024-8812", patientName: "Maria Santos", flag: "Unbundling", severity: "medium", description: "Separate billing of services that should be bundled", status: "open", createdAt: new Date(Date.now() - 3 * 86400000).toISOString() },
    { id: 3, claimId: 24, claimNumber: "CLM-2024-8756", patientName: "Robert Chen", flag: "Missing Modifier", severity: "low", description: "Procedure 27447 missing required modifier -RT", status: "resolved", createdAt: new Date(Date.now() - 5 * 86400000).toISOString() },
    { id: 4, claimId: 31, claimNumber: "CLM-2024-8743", patientName: "Linda Thompson", flag: "Invalid ICD Link", severity: "high", description: "CPT 93000 does not support primary diagnosis E11.9", status: "open", createdAt: new Date(Date.now() - 1 * 86400000).toISOString() },
    { id: 5, claimId: 9, claimNumber: "CLM-2024-8699", patientName: "David Wilson", flag: "Frequency Limit", severity: "medium", description: "71046 billed 3x this month, exceeds payer frequency limit", status: "pending", createdAt: new Date(Date.now() - 4 * 86400000).toISOString() },
  ]);
});

export default router;
