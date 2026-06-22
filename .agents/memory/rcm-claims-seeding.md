---
name: RCM Claims Seeding
description: Claims table seed can fail silently; diagnosis/procedure codes stored as JSON strings
---

# RCM Claims Seeding

The `claims` table seed failed once (table showed 0 rows) while all other tables seeded correctly. Root cause was unclear — possibly a constraint violation or timing issue.

**Rule:** After any seed operation, always verify with:
```sql
SELECT COUNT(*) FROM claims;
```

**How to apply:** Any time the database is reset or re-seeded, run this verification before starting the app. If count is 0, re-run the claims INSERT separately.

**Why:** The dashboard KPI query returns $0 and 0 claims if the table is empty — it's easy to miss because the API returns 200 OK (DB query succeeds, just with no rows).

## Claims JSON columns

`diagnosisCodes` and `procedureCodes` are stored as JSON strings (`text` column in DB):
- On INSERT: `JSON.stringify(array)`
- On SELECT: `JSON.parse(string)`
- The route files in `artifacts/api-server/src/routes/claims.ts` handle this automatically
