import { Router } from "express";

const router = Router();

router.get("/reports/kpis", async (_req, res) => {
  res.json({
    period: "Q4 2024",
    totalCharges: 15890000,
    totalCollections: 13920000,
    totalAdjustments: 1248000,
    netRevenue: 12672000,
    collectionRate: 87.6,
    denialRate: 12.4,
    arDays: 34.2,
    claimCount: 5841,
  });
});

router.get("/reports/payer-performance", async (_req, res) => {
  res.json([
    { payerName: "Medicare", claimsSubmitted: 2241, claimsPaid: 2098, denialRate: 6.4, avgReimbursementDays: 18.2, totalPaid: 4862300, collectionRate: 93.6 },
    { payerName: "Medicaid", claimsSubmitted: 1087, claimsPaid: 964, denialRate: 11.3, avgReimbursementDays: 28.7, totalPaid: 2148600, collectionRate: 88.7 },
    { payerName: "Blue Cross", claimsSubmitted: 1312, claimsPaid: 1181, denialRate: 9.9, avgReimbursementDays: 21.4, totalPaid: 2924100, collectionRate: 90.1 },
    { payerName: "Aetna", claimsSubmitted: 689, claimsPaid: 598, denialRate: 13.2, avgReimbursementDays: 24.8, totalPaid: 1487200, collectionRate: 86.8 },
    { payerName: "United Health", claimsSubmitted: 368, claimsPaid: 304, denialRate: 17.4, avgReimbursementDays: 32.1, totalPaid: 812400, collectionRate: 82.6 },
    { payerName: "Cigna", claimsSubmitted: 144, claimsPaid: 117, denialRate: 18.8, avgReimbursementDays: 35.6, totalPaid: 321800, collectionRate: 81.2 },
  ]);
});

router.get("/reports/provider-productivity", async (_req, res) => {
  res.json([
    { providerName: "Dr. Emily Carter", specialty: "Internal Medicine", totalCharges: 3240000, totalCollections: 2847600, claimsCount: 1082, avgChargePerEncounter: 2994, rvu: 4821 },
    { providerName: "Dr. Marcus Johnson", specialty: "Cardiology", totalCharges: 4180000, totalCollections: 3654200, claimsCount: 874, avgChargePerEncounter: 4783, rvu: 6312 },
    { providerName: "Dr. Sarah Lee", specialty: "Orthopedics", totalCharges: 3920000, totalCollections: 3421000, claimsCount: 721, avgChargePerEncounter: 5437, rvu: 5892 },
    { providerName: "Dr. Robert Kim", specialty: "Gastroenterology", totalCharges: 2840000, totalCollections: 2428800, claimsCount: 963, avgChargePerEncounter: 2949, rvu: 4218 },
    { providerName: "Dr. Angela Torres", specialty: "Neurology", totalCharges: 3610000, totalCollections: 3087000, claimsCount: 812, avgChargePerEncounter: 4445, rvu: 5641 },
  ]);
});

export default router;
