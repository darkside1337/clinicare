-- READ-ONLY audit: list users with their privilege fields.
-- Column names verified against lib/db/auth-schema.ts
-- (table "user": id, email, role, clinic_id, created_at, updated_at).
-- Do NOT run against production without approval.
SELECT id, email, role, clinic_id, created_at, updated_at
FROM "user"
ORDER BY updated_at DESC;

-- ---------------------------------------------------------------------------
-- Remediation statements (COMMENTED OUT — review before running, never on
-- production without a backup). Replace <user-id>, <role>, <clinic-id>.
-- ---------------------------------------------------------------------------

-- Reset a user's role and clinic assignment:
-- UPDATE "user"
-- SET role = '<role>', clinic_id = '<clinic-id>', updated_at = NOW()
-- WHERE id = '<user-id>';

-- Invalidate all sessions for a user (forces re-login with corrected fields):
-- DELETE FROM session
-- WHERE user_id = '<user-id>';
