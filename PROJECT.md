# Project Architecture

## Purpose
Equipment Uptime is a hospital clinical‑engineering platform that enables:

- **Staff** to report device problems.
- **Staff personnel** to assign, track, and resolve work orders.
- **Administrators** to maintain an equipment registry and facility settings.

The goal is to provide a real‑time, auditable dashboard for equipment status, maintenance history, and staff workload.

---

## Technology Stack
| Layer | Tools |
|-------|-------|
| **Frontend** | React 19, TypeScript, Vite |
| **Styling** | Tailwind CSS, Lucide icons |
| **Backend** | Supabase (PostgreSQL + Row‑Level Security) |
| **Data Access** | `@supabase/supabase-js` (browser‑to‑database) |
| **Build / Lint** | npm scripts (`lint`, `build`) |

---

## Data Flow Overview
1. **App Initialization (`src/App.tsx`)**  
   - Fetches all domain tables from Supabase on mount.  
   - Converts database `snake_case` fields to UI `camelCase`.  
   - Derives UI‑only display values (e.g., `equipmentName`, `assignedTechnicianName`) from foreign‑key relationships.  
   - Calls explicit row converters in `src/lib/supabase.ts` to strip display‑only columns before writes.

2. **State Management**  
   - Global slices hold `equipmentList`, `technicians`, `problemReports`, `maintenanceRecords`, `notifications`, `facilitySettings`, and `currentRole`.  
   - UI components subscribe to these slices via React hooks.

3. **CRUD Operations**  
   - **Create** – Insert rows via Supabase client; converters ensure only valid DB columns are sent.  
   - **Read** – Select queries with RLS policies enforce row‑level security.  
   - **Update** – Partial updates with explicit field mapping to avoid accidentally persisting UI‑only fields.  
   - **Delete** – Soft‑delete pattern (e.g., marking a record as inactive) is used where appropriate.

---

## Core Database Tables
| Table | Description |
|-------|-------------|
| `equipment` | Master catalog of medical devices. |
| `technicians` | List of staff (includes workload counters). |
| `problem_reports` | Work‑order tickets generated from staff reports. |
| `maintenance_records` | History of maintenance actions per piece of equipment. |
| `notifications` | System alerts (e.g., critical failures, assignment updates). |
| `facility_settings` | Global configuration (hospital name, contact phone, etc.). |
| `profiles` | User profile data linked to Supabase auth (`role`, etc.). |

*UI fields such as `equipmentName`, `assignedTechnicianName`, and maintenance `technicianName` are derived UI values; they are **not** stored columns.*

---

## Important Implementation Details
- **Naming Conventions**  
  - Database → UI: `snake_case` → `camelCase`.  
  - UI‑only derived fields are prefixed with `*Name` to signal they originate from relational data.

- **Row‑Level Security (RLS)**  
  - All writes go through RLS policies; client‑side role checks are **never** the security boundary.

- **Equipment Status Lifecycle**  
  - `Working` → `Needs Attention` → `Under Maintenance` → `Down` (based on ticket severity and assignment).  
  - Status transitions trigger updates to related `technicians` workload counters.

- **Reporting Workflow**  
  1. Staff submits a `problem_reports` row.  
  2. Associated equipment status is updated (`Down` or `Needs Attention`).  
  3. A notification is inserted and propagated to the UI.  
  4. Assignment of a technician updates workload counters and equipment status to `Under Maintenance`.

- **No Mock Data**  
  - The UI renders an empty dashboard when the database contains no rows. This ensures that production‑like data is required for meaningful testing.

---

## Configuration
- **Environment Variables**  
  Use `.env.example` as the template. Required variables must be set in local development and on Vercel:

  ```text
  VITE_SUPABASE_URL=https://your-project-ref.supabase.co
  VITE_SUPABASE_ANON_KEY=your-supabase-publishable-key
  ```

  - **Never** use the `/rest/v1` endpoint suffix; always reference the project root URL.

- **Vite Settings**  
  - `vite.config.ts` is configured to alias `@/*` to the `src/` directory for cleaner imports.

---

## Verification & Build Process
Run the following commands before any deployment:

```bash
npm run lint      # ESLint + Typechecked lint rules
npm run build     # Production‑ready bundling
```

- **Lint** fails on unused variables, misspelled imports, and rule violations.  
- **Build** produces an optimized static bundle that can be served by any CDN (e.g., Vercel, Netlify).

---

## Security Considerations
- **Supabase RLS** is the sole enforcement mechanism for data access.  
- Client‑side role checks (e.g., `profile.role` UI toggles) **must not** be relied upon for security.  
- For production use with real healthcare data:  
  1. Enforce authentication via Supabase Auth.  
  2. Restrict RLS policies to `profiles.role`‑based access (e.g., only `admin` can edit `facility_settings`).  
  3. Conduct a penetration test focusing on data exfiltration vectors.

---

## Future Work
- **Mock‑Data Backend** – Add a lightweight mock API for offline development.  
- **Dashboard Enhancements** – Real‑time charts (equipment uptime, technician workload) using a lightweight charting library (e.g., Chart.js).  
- **Authentication Providers** – Support SSO (SAML/OIDC) in addition to Supabase Auth.  
- **Accessibility Audits** – Full WCAG 2.2 compliance testing and remediation.  

---  

*Document generated on 2026‑09‑27. For any questions or contributions, please open an issue or submit a pull request.*  