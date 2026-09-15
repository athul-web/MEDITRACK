# Project architecture

## Purpose

Equipment Uptime supports a hospital clinical-engineering workflow: staff can report device problems, biomedical staff can assign and resolve work orders, and administrators can maintain the equipment registry and facility settings.

## Technology

- React 19, TypeScript, and Vite
- Supabase Postgres and Row Level Security
- `@supabase/supabase-js` for browser-to-database communication
- Tailwind CSS utilities and Lucide icons

## Data flow

`src/App.tsx` is the application controller. On load it fetches records from Supabase, converts database `snake_case` to UI `camelCase`, then derives display-only names from their relational IDs. Writes use explicit row converters in `src/lib/supabase.ts`; those remove display-only fields before a Supabase insert or update.

The core tables are:

- `equipment`
- `technicians`
- `problem_reports`
- `maintenance_records`
- `notifications`
- `facility_settings`
- `profiles`

## Important implementation details

- `equipmentName`, `assignedTechnicianName`, and maintenance `technicianName` are UI fields. They are generated from foreign-key relationships and are not database columns.
- Reporting an issue creates a `problem_reports` row and updates the associated equipment status.
- Assigning and resolving a repair update technician workload as well as the work order and equipment state.
- The app has no mock-data fallback. An empty database renders an empty dashboard.

## Configuration

Use `.env.example` as the configuration template. Both variables must be set in local development and Vercel:

```text
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-publishable-key
```

Use the project-root URL, not its `/rest/v1` endpoint.

## Verification

Run the following before deployment:

```bash
npm run lint
npm run build
```

## Security

Supabase RLS is the actual authorization boundary. Client-side role controls must never be treated as security controls. Before production use with real healthcare data, require authenticated users and restrict policies by `profiles.role`.
