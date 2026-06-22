---
name: RCM DB Numeric Types
description: Drizzle numeric columns return strings; always wrap with Number() before arithmetic
---

# RCM DB Numeric Types

All monetary/decimal columns in this project use Drizzle's `numeric()` type (PostgreSQL `NUMERIC`). Drizzle-ORM returns these as JavaScript **strings**, not numbers.

**Examples affected:**
- `claimsTable.totalCharge`, `paidAmount`, `allowedAmount`, `patientBalance`
- `paymentsTable.amount`, `adjustments`
- `denialsTable.amount`
- `patientsTable.balance`
- `payersTable.avgReimbursementDays`, `denialRate`, `contractedRate`

**Rule:** Always use `Number(value ?? 0)` when doing arithmetic on these values.

**Why:** `sum()` from drizzle also returns a string. Direct arithmetic on strings produces NaN or concatenation bugs.

**How to apply:** In any route or component that aggregates or computes with these values:
```ts
const totalPaid = Number(claimStats.totalPaid ?? 0);
const collectionRate = totalCharges > 0 ? (totalPaid / totalCharges) * 100 : 0;
```
