/*
# Create per-user app data table

1. New Tables
- `user_app_data`
  - `user_id` (uuid, primary key): the signed-in account that owns the row. Defaults to the current user, and references the built-in accounts table so a row is removed when its account is deleted.
  - `data` (jsonb, not null): the full saved state for that user (tasbeeh counts, daily dhikr progress, reminder and display settings).
  - `updated_at` (timestamptz): when the row was last saved.

2. Security
- Row level security is enabled on `user_app_data`.
- Only the `authenticated` role is granted access. Anonymous visitors cannot read or write anything.
- Four separate policies (select, insert, update, delete) each require `auth.uid() = user_id`, so a user can only see and change their own row.

3. Important notes
- 1. The table stores one row per account; the app upserts that row whenever the user's data changes.
- 2. No passwords or account records are created here; accounts are managed by the built-in sign-in system.
- 3. Safe to re-run: the table, grants and policies are created only if missing or replaced.
*/

CREATE TABLE IF NOT EXISTS user_app_data (
  user_id uuid PRIMARY KEY DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  data jsonb NOT NULL DEFAULT '{}'::jsonb,
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE user_app_data ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, UPDATE, DELETE ON user_app_data TO authenticated;

DROP POLICY IF EXISTS "select_own_app_data" ON user_app_data;
CREATE POLICY "select_own_app_data" ON user_app_data FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_app_data" ON user_app_data;
CREATE POLICY "insert_own_app_data" ON user_app_data FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_app_data" ON user_app_data;
CREATE POLICY "update_own_app_data" ON user_app_data FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_app_data" ON user_app_data;
CREATE POLICY "delete_own_app_data" ON user_app_data FOR DELETE
  TO authenticated USING (auth.uid() = user_id);
