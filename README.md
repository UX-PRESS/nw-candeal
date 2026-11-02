# Agenda Congregação — MVP 1.1

A responsive weekly congregation assignment schedule backed by Supabase. Authenticated users can view assignments; only designated administrators can create, edit, or delete them.

## Prerequisites

- Node.js 20.9 or later
- npm 10 or later
- A Supabase project with Email/Password authentication enabled

## Local setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Copy `.env.example` to `.env.local` and fill in the project URL and public anon key from **Supabase → Project Settings → API**:

   ```dotenv
   NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
   ```

   These are the only Supabase variables needed by the app. The anon key is a public client key; database access is restricted by RLS. Never put a `service_role` key in a `NEXT_PUBLIC_*` variable or in this project.

3. In the Supabase SQL Editor for the project configured in the app, run the original schema migrations in order: `20261102000100_create_assignments.sql`, then `20261102000200_add_assignment_congregation_name.sql`. Check first whether the schema already exists; `CREATE TABLE IF NOT EXISTS` does not repair an existing table with missing columns. Existing assignment rows are retained.
4. Create user accounts in **Supabase → Authentication → Users**. The app has no public sign-up flow.
5. To inspect the target project's objects, RLS policies, administrator membership, and admin-helper result without changing data, replace the email in `supabase/diagnose-access.sql` and run its statements in the SQL Editor. Use this check before changing existing policies.
6. To allow one user to manage assignments, replace `replace-with-admin-email@example.com` in `supabase/create-first-admin.sql` with that existing user's email and run the script in the SQL Editor. Regular authenticated users can view assignments without being administrators. To revoke administrator access, delete that user's row from `public.assignment_admins`.
7. After applying the first two migrations and confirming the admin table/function exist, run `20261102000300_manage_assignment_admins.sql`. It adds admin-guarded database functions for listing, adding, and removing admins, including protection against concurrent removal of the last admin.
8. Optionally run `supabase/seed.sql` in the SQL Editor to insert clearly fictional sample assignments for the current week. This is separate from application startup and is safe to re-run.
9. Start the app:

   ```bash
   npm run dev
   ```

Open [http://localhost:3000](http://localhost:3000) and sign in with a Supabase Auth account.

## Database and security

- The migration creates `public.assignments`, its date and meeting-type indexes, the `public.assignment_admins` role table, and the `public.is_assignment_admin()` helper.
- The follow-up migration adds nullable `assignments.congregation_name` without changing or deleting existing records. It grants the existing authenticated role column-level write access; RLS still limits writes to administrators.
- RLS is enabled. Authenticated users can read assignments; insert, update, and delete policies require an administrator row. Anonymous access is revoked.
- The application checks administrator status with `public.is_assignment_admin()` and fails closed: if the function is unavailable, the role is shown as unverified and assignment management controls stay hidden.
- Any authenticated user can request participant names for dropdowns; the `participants` table must allow authenticated `SELECT` through its own grants and RLS. Participant writes must remain administrator-only.
- Administrators can manage admin memberships from the dashboard. The management RPCs verify `auth.uid()` via `is_assignment_admin()` in the database, and are not executable by anonymous users. Removing the last administrator is prevented under an exclusive table lock. No service-role key or additional environment variable is used.
- Assignment reads and mutations run in server actions using the signed-in user's cookie session and the public anon key. RLS remains the database authorization boundary.
- The assignment form reads participant names from `public.participants.name` for both dropdowns. The signed-in account must be allowed to read that table under its existing grants and RLS policies. Assignment records continue storing participant and assistant names as text; the app does not create or modify participant records.
- When editing an older assignment, a saved participant name remains available in the dropdown even if it is no longer returned from `public.participants`.
- `proxy.ts` refreshes Supabase Auth cookies. Server-rendered page data is fetched for the authenticated request.
- No service-role key, custom database bypass, or browser-side privileged credential is used.
- `data/assignments.ts` is preserved as the original mock-data source for reference. It is not loaded as a fallback and is not automatically copied into the database; use the optional SQL seed when desired.

## Persistence verification

1. Sign in as the administrator and add a uniquely named assignment.
2. Reload the page, navigate away and back to the week, and confirm the record remains.
3. Edit it, reload, and confirm the changed information remains.
4. Delete it and confirm it is absent after reloading.
5. Sign in as a regular authenticated user on another browser/device and confirm the record is visible but management controls are not.
6. While signed in as that regular user, attempt a direct create/update/delete request; it must be rejected by the server action and by RLS.

The UI hiding controls is not the security boundary: each mutation checks the authenticated administrator role on the server, and the database independently enforces the same rule with RLS.

## Validation

```bash
npm run lint
npx tsc --noEmit
npm run build
```

The SQL migration and persistence/permission behavior must also be verified against a configured Supabase project; a build without credentials cannot verify remote database behavior.

## Vercel

The existing Vercel project should keep its current build and Git settings. Add `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` to the required Vercel environments (Production, Preview, and Development as applicable), using values from the same Supabase project. Preserve unrelated environment variables and never configure the service-role key for this app.

After running the database migration and configuring variables, deploy through the existing Vercel workflow when ready. This implementation does not trigger a deployment.

## Scope and limitations

This MVP covers weekly assignments only. There is no public account registration, member directory, reports, territories, notifications, or other congregation module. The fictional SQL seed is optional and should be replaced with authorized congregation data.
