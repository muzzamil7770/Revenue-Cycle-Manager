---
name: RCM Generated Hook Signatures
description: Orval-generated mutation hooks use specific parameter shapes that differ from intuition
---

# RCM Generated Hook Signatures

Orval generates mutation hooks with specific parameter shapes based on the OpenAPI spec. These differ from what you might guess.

**Key examples:**
- `useDeleteUser` → `mutate({ id: number })` — NOT `{ userId: number }`
- `useSubmitClaim` → `mutate({ claimId: number })` — the path param name from the spec
- `useUpdateDenial` → `mutate({ denialId: number, data: {...} })`

**Why:** Orval reads the OpenAPI path parameter names (`{id}`, `{claimId}`, etc.) and uses them as the mutation input property names.

**How to apply:** Before calling any generated mutation, grep the generated file:
```
grep -A5 "useDeleteUser\|useSomeMutation" lib/api-client-react/src/generated/api.ts
```
Look for the `MutationFunction` type to see the exact `{paramName: type}` shape.
