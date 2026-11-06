/*
# Revoke anonymous access to user_app_data

1. Modified Tables
- `user_app_data`: removes table privileges previously granted to the `anon` role.

2. Security
- Only signed-in users (`authenticated`) can read or write their own row.
- Row level security and the owner-only policies are unchanged.

3. Important Notes
- No data is changed or deleted.
- Anonymous requests already returned no rows; this removes the unused grant.
*/

REVOKE ALL ON user_app_data FROM anon;
