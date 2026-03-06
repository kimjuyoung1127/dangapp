# 10 Diagnosis Runbook

## Phase 1 - Confirm the failing path
1. Identify the exact RPC or query name.
2. Identify the caller: route, hook, or service function.
3. Capture the expected input params and expected row shape.

## Phase 2 - Reproduce outside the UI
1. Run the query or RPC directly through Supabase MCP or a direct REST call.
2. Compare the raw response with the frontend expectation.
3. Check whether the failure is:
   - empty but successful
   - auth or RLS blocked
   - shape mismatch
   - hard error

## Phase 3 - Narrow the cause
1. Check base tables first.
2. Check filter clauses and join assumptions.
3. Check whether auth context changes the result.
4. If needed, create a temporary debug query or debug RPC that exposes intermediate conditions.

## Phase 4 - Classify the fix
- Database issue: migration, RLS, seed, or RPC logic
- Contract issue: frontend expectation differs from actual response
- App issue: wrong parameters, wrong user mapping, or wrong query timing
