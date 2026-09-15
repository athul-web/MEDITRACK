# Equipment Uptime

A React and TypeScript dashboard for tracking hospital equipment, incident reports, repairs, maintenance history, technicians, and facility settings. Operational data is stored in Supabase; the application contains no built-in seed or mock records.

## Requirements

- Node.js 20 or later
- A Supabase project with the schema from `supabase_schema.sql` deployed

## Local setup

1. Install dependencies with `npm install`.
2. Copy `.env.example` to `.env`.
3. Set `VITE_SUPABASE_URL` to your Supabase **project root URL** (for example, `https://your-project-ref.supabase.co`, without `/rest/v1`).
4. Set `VITE_SUPABASE_ANON_KEY` to the project publishable/anon key.
5. Start the app with `npm run dev`.

## Commands

```bash
npm run dev
npm run lint
npm run build
```

## Deploying to Vercel

Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` to the project’s Vercel environment variables for every deployment environment you use, then redeploy. Vite embeds these values during the build.

## Data model

The Supabase schema includes equipment, technicians, problem reports, maintenance records, notifications, facility settings, and user profiles. The client keeps display names derived from relational IDs, so `equipment_name` and `assigned_technician_name` are never written to tables that do not define those columns.

## Security note

The current schema includes demonstration-friendly read policies. Before storing real healthcare or operational data, replace them with policies that require signed-in users and enforce the `profiles.role` permissions server-side. A role selector in the browser is a UI convenience, not an authorization boundary.
