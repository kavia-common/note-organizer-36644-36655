# Ocean Notes Frontend

This React app provides a modern, lightweight notes interface backed by Supabase. It implements a single‑page layout with a sidebar of notes and a main editor. Supabase is used for CRUD operations and optional email magic link authentication.

## Quick Start

1. Ensure you have Node.js 18+ installed.
2. Copy the example below into a `.env` file in this folder and replace placeholders:
   ```
   REACT_APP_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
   REACT_APP_SUPABASE_KEY=YOUR_ANON_PUBLIC_KEY
   # Optional: enable auth mode (per-user notes)
   REACT_APP_FEATURE_FLAGS=auth
   # Optional: commonly used variables supported by the app/runtime
   REACT_APP_FRONTEND_URL=http://localhost:3000
   ```
3. Install dependencies and start the dev server:
   - npm install
   - npm start
4. Open http://localhost:3000 in your browser.

If REACT_APP_FEATURE_FLAGS includes auth, you will be prompted to sign in via a magic link using Supabase Auth. If not, the app runs in anonymous demo mode.

## Environment Configuration

This app reads configuration using Create React App conventions, so variables must be prefixed with REACT_APP_. The following are used by the code:

- Required
  - REACT_APP_SUPABASE_URL: Your Supabase project URL.
  - REACT_APP_SUPABASE_KEY: Your Supabase anon public key (never use service role keys in the browser).
- Optional
  - REACT_APP_FEATURE_FLAGS: Comma-separated list of flags. Supported: auth
    - When "auth" is present, notes are scoped per authenticated user_id.
    - When absent, the app works in an anon/demo mode with no user scoping.
  - REACT_APP_FRONTEND_URL: Used as the redirect target for magic link sign-in, defaults to window.location.origin.

Additional variables supported by the container runtime but not explicitly used by this app’s code today:
REACT_APP_API_BASE, REACT_APP_BACKEND_URL, REACT_APP_WS_URL, REACT_APP_NODE_ENV, REACT_APP_NEXT_TELEMETRY_DISABLED, REACT_APP_ENABLE_SOURCE_MAPS, REACT_APP_PORT, REACT_APP_TRUST_PROXY, REACT_APP_LOG_LEVEL, REACT_APP_HEALTHCHECK_PATH, REACT_APP_EXPERIMENTS_ENABLED.

Environment handling in code:
- src/utils/env.js provides getEnv and featureFlags parsing.
- src/lib/supabaseClient.js initializes the client and exposes getSupabase(), checkConnectivity(), and getSupabaseEnvStatus() for banner warnings and connectivity checks.

## Supabase Schema

Create a notes table with timestamps and optional user ownership.

```sql
-- Table
create table if not exists public.notes (
  id uuid primary key default gen_random_uuid(),
  title text not null default '',
  content text not null default '',
  user_id uuid null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Keep updated_at current
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_notes_updated_at on public.notes;
create trigger trg_notes_updated_at
before update on public.notes
for each row execute function public.set_updated_at();

-- Helpful index when scoping by user
create index if not exists idx_notes_user_id on public.notes(user_id);
create index if not exists idx_notes_updated_at on public.notes(updated_at desc);
```

The frontend expects the table name "notes" and columns: id, title, content, user_id, created_at, updated_at. See:
- src/services/notesService.js for CRUD queries
- src/hooks/useNotes.js for state and autosave
- src/components/auth/AuthGate.js for email magic-link sign-in

## Row Level Security (RLS) Policies

Enable RLS:
```sql
alter table public.notes enable row level security;
```

Choose one of the following policy sets depending on your mode.

### A) Anonymous demo mode (no auth flag)

Grant full access to anon key so anyone can read/write demo notes. Use with caution in public deployments.

```sql
-- Allow anyone (authenticated or not) to read notes
create policy "anon_read_all"
on public.notes for select
to anon
using (true);

-- Allow anyone to insert notes (user_id may be null)
create policy "anon_insert_all"
on public.notes for insert
to anon
with check (true);

-- Allow anyone to update any note
create policy "anon_update_all"
on public.notes for update
to anon
using (true)
with check (true);

-- Allow anyone to delete any note
create policy "anon_delete_all"
on public.notes for delete
to anon
using (true);
```

This matches the app’s behavior when REACT_APP_FEATURE_FLAGS does not include "auth" (user_id is not required).

### B) Per-user auth mode (REACT_APP_FEATURE_FLAGS=auth)

In this mode, authenticated users can only access their own notes. The frontend sets user_id on insert when a session exists.

```sql
-- Require sign-in to access data
create policy "authenticated_can_read_own"
on public.notes for select
to authenticated
using (auth.uid() is not null and user_id = auth.uid());

create policy "authenticated_can_insert_own"
on public.notes for insert
to authenticated
with check (
  auth.uid() is not null
  and (user_id is null or user_id = auth.uid())
);

create policy "authenticated_can_update_own"
on public.notes for update
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

create policy "authenticated_can_delete_own"
on public.notes for delete
to authenticated
using (user_id = auth.uid());
```

Notes:
- The insert policy allows user_id to be null to support legacy or migration scenarios, but the frontend will set user_id when authenticated.
- Consider adding a default value for user_id using auth.uid() via a trigger if you want to enforce it at the database level.

## Running and Scripts

- npm start: Runs the app in development mode.
- npm test: Launches the test runner.
- npm run build: Builds the app for production.

## Troubleshooting

- Supabase not configured banner:
  - The header will show a warning if REACT_APP_SUPABASE_URL or REACT_APP_SUPABASE_KEY is missing. Define both in your .env and restart npm start.
- Connectivity shows Offline:
  - src/lib/supabaseClient.js checkConnectivity calls a lightweight auth endpoint. Verify your project URL and anon key and that your CORS settings in Supabase allow http://localhost:3000.
- Auth magic link not working:
  - Set REACT_APP_FRONTEND_URL to your local origin (e.g., http://localhost:3000) and add that URL to Redirect URLs in Supabase Authentication settings.
  - Ensure your email provider is configured in Supabase and you’re using the anon public key in the browser.
- 401/permission errors in auth mode:
  - Confirm RLS policies are created under the correct schema/table and that "authenticated" role policies exist.
  - Verify that notes rows have user_id set to the authenticated user’s UUID.
- Search not filtering results:
  - The UI sends ilike filters on title/content. Ensure the notes table has text columns and that you’re typing at least one character.
- Build fails or ESLint errors:
  - Use Node 18+ and clear cache if needed (rm -rf node_modules; npm install).
  - The codebase uses CRA; ensure environment variable names start with REACT_APP_.

## Code Pointers

- Supabase client initialization: src/lib/supabaseClient.js
- Notes CRUD service: src/services/notesService.js
- Notes state and autosave: src/hooks/useNotes.js and src/hooks/useDebouncedCallback.js
- Auth gate (magic link): src/components/auth/AuthGate.js
- UI layout: src/components/Layout and src/components/common
- Theme utilities: src/utils/theme.js

## License

This project is intended as a lightweight template and example for the Ocean Notes app.
