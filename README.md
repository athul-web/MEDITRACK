# Equipment Uptime — Medical Equipment & Maintenance Management System

A comprehensive **Healthcare Facility Medical Equipment Uptime and Maintenance Management System** built with React 18, TypeScript, Vite, Tailwind CSS v4, and Supabase. Designed for biomedical engineering teams and clinical staff to track equipment status, manage work orders, coordinate technicians, and maintain regulatory-compliant maintenance audit trails.

---

## 🏥 Overview

**Equipment Uptime** is a purpose-built clinical engineering platform that enables hospitals and healthcare facilities to:

- **Monitor Fleet Health** — Real-time equipment status across all departments with uptime metrics
- **Manage Work Orders** — End-to-end breakdown reporting → technician dispatch → repair → certification
- **Coordinate Technicians** — Biomedical staff roster with workload balancing and certifications tracking
- **Maintain Audit Trails** — Complete maintenance history with CSV export for compliance (Joint Commission, NFPA 99, AAMI)
- **Enforce SLAs** — Critical incident response time tracking with configurable thresholds

---

## ✨ Key Features

### 📊 Equipment Fleet Dashboard
- **Dual View Modes** — Card grid (visual) and sortable data table (dense)
- **Multi-Dimensional Filtering** — By status, department, criticality tier, free-text search
- **Criticality Tiers** — Life Support (Tier 1) → Critical Diagnostic (Tier 2) → Patient Monitoring (Tier 3) → General Clinical (Tier 4)
- **Real-time Status Badges** — Operational, Down, Under Maintenance, Needs Attention with pulse/ping animations
- **Uptime Visualization** — Historical uptime percentage with color-coded progress bars
- **Smart Alerts Banner** — Auto-surfaces critical life-support device downtime

### 🔧 Work Order Management (Biomedical Workflow)
| Stage | Description | Actions |
|-------|-------------|---------|
| **1. Reported** | Clinical staff logs malfunction | Assign Technician |
| **2. Assigned** | Biomedical engineer dispatched | Start Repair / Reassign |
| **3. In Repair** | Active maintenance in progress | Resolve Repair / Reassign |
| **4. Resolved** | Certified return to service | — |

- **Severity Classification** — Critical / High / Medium / Low with clinical impact descriptions
- **Repair Notes Timeline** — Timestamped biomedical service updates
- **Parts Tracking** — Components replaced during corrective maintenance
- **Downtime & Cost Logging** — Hours offline + parts/labor costs per incident

### 👨‍🔬 Technician Coordination
- **Staff Roster** — CBET-certified biomedical equipment technicians
- **Live Workload** — Active ticket count with status auto-calculation (Available / Assigned / On Call)
- **Specialty Matching** — Filter by expertise (Ventilators, Imaging, Dialysis, Anesthesia, etc.)
- **Contact Quick-Copy** — Phone/email with clipboard integration
- **Certification Tracking** — CBET, CRES, CHTM, manufacturer-specific credentials

### 📋 Maintenance History & Compliance
- **Complete Audit Trail** — Every service event: Corrective Repair, Preventive Maintenance, Calibration, Inspection
- **Filter & Search** — By type, equipment, technician, date range, parts
- **CSV Export** — One-click download for regulatory submissions
- **Cost & Downtime Aggregation** — Period totals for budgeting and KPI reporting

### ⚙️ Facility Configuration
- Hospital name, facility code
- SLA thresholds (Critical / High priority response hours)
- Biomedical dispatch hotline & clinical engineering email
- Role-based access: **Staff** (clinical) vs **Admin** (biomedical engineering)

---

## 🛠 Technology Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | React 18, TypeScript, Vite 5 |
| **Styling** | Tailwind CSS v4 (zero-config, native CSS variables) |
| **Routing** | React Router v6 |
| **Backend/Database** | Supabase (PostgreSQL + Auth + Realtime) |
| **Icons** | Lucide React |
| **State** | React Hooks (useState, useMemo, useEffect) — no external state library |
| **Build** | Vite with path aliases (`@/*` → `src/*`) |

---

## 📁 Project Structure

```
health-care-v2/
├── index.html                    # Entry HTML with meta tags
├── vite.config.ts                # Vite + Tailwind + React config
├── tsconfig.json                 # TypeScript configuration
├── .env.example                  # Environment variable template
├── metadata.json                 # App metadata
├── src/
│   ├── main.tsx                  # App bootstrap + StrictMode
│   ├── AppRouter.tsx             # Auth-guarded routing
│   ├── App.tsx                   # Main application (state, data, handlers)
│   ├── index.css                 # Tailwind v4 import + global styles
│   ├── types.ts                  # TypeScript interfaces & types
│   ├── lib/
│   │   └── supabase.ts           # Supabase client + DB mappers
│   └── components/
│       ├── Header.tsx            # Top bar: branding, role switch, notifications, logout
│       ├── Login.tsx             # Animated ECG-themed login page
│       ├── StatsOverview.tsx     # Fleet metrics + critical alert banner
│       ├── EquipmentCard.tsx     # Card view: equipment summary + actions
│       ├── EquipmentTable.tsx    # Table view: sortable, dense equipment list
│       ├── EquipmentDetailModal.tsx # 3-tab detail: Overview / Ticket / History
│       ├── ReportProblemModal.tsx   # Breakdown reporting form
│       ├── AssignTechModal.tsx      # Technician dispatch workflow
│       ├── ResolveRepairModal.tsx   # Repair sign-off & certification
│       ├── AddEditEquipmentModal.tsx # Equipment CRUD
│       ├── MaintenanceHistoryView.tsx # Audit log with CSV export
│       ├── WorkOrdersView.tsx       # Kanban-style work order board
│       ├── TechniciansView.tsx      # Biomedical team roster
│       ├── SettingsModal.tsx        # Facility configuration
│       └── StatusBadge.tsx          # Reusable status/criticality/severity badges
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** 18+ (LTS recommended)
- **npm** 9+ (or yarn/pnpm)
- **Supabase Account** — [Create a project](https://supabase.com)

### Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd health-care-v2

# Install dependencies
npm install

# Copy environment template and configure
cp .env.example .env
# Edit .env with your Supabase credentials
```

### Environment Variables

Create a `.env` file in the project root:

```env
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### Supabase Database Setup

Run the following SQL in your Supabase SQL Editor to create the required tables:

```sql
-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Equipment table
create table equipment (
  id text primary key,
  name text not null,
  model text not null,
  manufacturer text not null,
  serial_number text not null,
  department text not null,
  room text not null,
  status text not null check (status in ('Working', 'Down', 'Under Maintenance', 'Needs Attention')),
  criticality text not null check (criticality in ('Life Support', 'Critical Diagnostic', 'Patient Monitoring', 'General Clinical')),
  install_date date not null,
  last_maintenance_date date,
  next_scheduled_maintenance date,
  assigned_technician_id text,
  active_ticket_id text,
  uptime_percentage numeric default 100,
  total_downtime_hours numeric default 0,
  specifications jsonb,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Technicians table
create table technicians (
  id text primary key,
  name text not null,
  title text not null,
  email text not null,
  phone text not null,
  specialty text not null,
  status text not null check (status in ('Available', 'Assigned', 'On Call', 'Off Duty')),
  active_tickets_count integer default 0,
  certifications text[] default '{}',
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Problem Reports (Work Orders)
create table problem_reports (
  id text primary key,
  equipment_id text not null references equipment(id),
  equipment_name text not null,
  department text not null,
  room text not null,
  severity text not null check (severity in ('Critical', 'High', 'Medium', 'Low')),
  status text not null check (status in ('Reported', 'Assigned', 'In Repair', 'Resolved')),
  reported_by text not null,
  reported_role text not null,
  reported_at timestamp with time zone not null,
  issue_description text not null,
  assigned_technician_id text,
  assigned_at timestamp with time zone,
  repair_notes text[] default '{}',
  resolved_at timestamp with time zone,
  resolution_summary text,
  parts_used text[] default '{}',
  downtime_hours numeric,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Maintenance Records
create table maintenance_records (
  id text primary key,
  equipment_id text not null references equipment(id),
  equipment_name text not null,
  date date not null,
  type text not null check (type in ('Corrective Repair', 'Preventive Maintenance', 'Calibration', 'Inspection')),
  technician_id text,
  technician_name text not null,
  description text not null,
  parts_replaced text[] default '{}',
  downtime_hours numeric not null,
  cost numeric,
  resolved_date timestamp with time zone not null,
  notes text,
  created_at timestamp with time zone default now()
);

-- Notifications
create table notifications (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  message text not null,
  type text not null check (type in ('alert', 'warning', 'info', 'success')),
  timestamp timestamp with time zone not null,
  equipment_id text,
  read boolean default false,
  created_at timestamp with time zone default now()
);

-- Facility Settings
create table facility_settings (
  id integer primary key default 1,
  hospital_name text not null default 'Medical Center',
  facility_code text,
  sla_critical_hours integer not null default 2,
  sla_high_hours integer not null default 8,
  primary_contact_phone text,
  maintenance_email text,
  updated_at timestamp with time zone default now()
);

-- RPC: Increment equipment downtime
create or replace function increment_equipment_downtime(equipment_id text, hours numeric)
returns void language plpgsql as $$
begin
  update equipment
  set total_downtime_hours = coalesce(total_downtime_hours, 0) + hours,
      uptime_percentage = greatest(0, 100 - (coalesce(total_downtime_hours, 0) + hours) / 8760.0 * 100)
  where id = equipment_id;
end;
$$;

-- Row Level Security (enable as needed)
alter table equipment enable row level security;
alter table technicians enable row level security;
alter table problem_reports enable row level security;
alter table maintenance_records enable row level security;
alter table notifications enable row level security;
alter table facility_settings enable row level security;
```

### Development

```bash
# Start dev server (http://localhost:5173)
npm run dev

# Type-check
npm run build
```

### Production Build

```bash
npm run build
# Output in dist/ — deploy to Vercel, Netlify, or any static host
```

---

## 🔐 Authentication & Roles

The app uses **Supabase Auth** with email/password. Two roles are supported via local state (can be extended to Supabase JWT claims):

| Role | Access | Typical User |
|------|--------|--------------|
| **Staff** | View equipment, report problems, view work orders, view history | Nurses, physicians, clinical staff |
| **Admin** | All Staff permissions + equipment CRUD, technician assignment, repair resolution, status updates, facility settings | Biomedical engineers, clinical engineering leads |

**Role Switcher** in header allows instant context switching for demo/testing.

---

## 📱 Key User Flows

### 1. Report Equipment Problem (Staff)
1. Click **"Report Problem"** in header or on equipment card
2. Select equipment from dropdown (pre-fills department, room, criticality)
3. Choose **Severity**: Critical (life-support) → High → Medium → Low
4. Enter **exact location** (bed/bay), **detailed symptoms** (error codes, alarms)
5. Enter **your name & role**
6. Submit → Auto-creates ticket, updates equipment status, notifies biomedical team

### 2. Dispatch Technician (Admin)
1. Open **Work Orders** tab → filter "Reported"
2. Click **"Assign Tech"** on a ticket
3. Select technician (shows specialty, status, current workload)
4. Add **dispatch notes** (parts to bring, coordination instructions)
5. Confirm → Equipment status → "Under Maintenance", technician → "Assigned"

### 3. Perform Repair & Certify (Admin)
1. Technician works on device → clicks **"Start Repair"** (status → "In Repair")
2. On completion, click **"Resolve Repair"**
3. Enter: **Resolution summary**, **parts replaced**, **downtime hours**, **cost**, **certifying technician name**
4. Submit → Creates maintenance record, equipment → "Working", ticket → "Resolved"

### 4. Compliance Reporting
1. Navigate to **Maintenance History**
2. Filter by date range, service type, equipment
3. Click **"Export CSV"** → Downloads audit-ready log

---

## 🎨 Design System

### Color Palette (Semantic)
| Semantic | Light | Dark | Usage |
|----------|-------|------|-------|
| **Primary** | Blue 600 | Blue 500 | Actions, links, focus rings |
| **Success** | Emerald 600 | Emerald 500 | Operational, resolved, uptime |
| **Warning** | Amber 600 | Amber 500 | Maintenance, assigned, SLA |
| **Danger** | Rose 600 | Rose 500 | Down, critical, reported |
| **Info** | Sky 600 | Sky 500 | Info, patient monitoring |
| **Neutral** | Slate 50–900 | Slate 900–50 | Text, borders, backgrounds |

### Component Patterns
- **Cards** — `rounded-xl border border-slate-200 bg-white shadow-xs hover:shadow-md`
- **Modals** — `fixed inset-0 z-50 bg-slate-900/60 backdrop-blur` + centered `max-w-* rounded-2xl`
- **Badges** — `inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs`
- **Buttons** — Primary: `bg-blue-600 hover:bg-blue-700`, Danger: `bg-rose-600`, Success: `bg-emerald-600`
- **Inputs** — `rounded-lg border border-slate-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500`

---

## 🔌 Supabase Integration

### Client Setup (`src/lib/supabase.ts`)
```typescript
import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);
```

### Data Mapping Strategy
- **Snake_case** in database ↔ **camelCase** in frontend
- Mapper functions: `mapDbToFrontend<T>()`, `mapFrontendToDb()`
- Row insert helpers: `toEquipmentRow()`, `toProblemReportRow()`, etc.
- Enrichment functions join related data (technician names, equipment names)

### Real-time Ready
Supabase subscriptions are configured in `AppRouter.tsx` for auth state. Extend to equipment/tickets for live updates:

```typescript
supabase
  .channel('equipment-changes')
  .on('postgres_changes', { event: '*', schema: 'public', table: 'equipment' }, payload => {
    // Update local state
  })
  .subscribe();
```

---

## 📦 Deployment

### Vercel (Recommended)
```bash
npm i -g vercel
vercel --prod
```
Set environment variables in Vercel dashboard.

### Netlify
```bash
npm run build
netlify deploy --prod --dir=dist
```

### Docker
```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

---

## 🧪 Testing Checklist

- [ ] Login with valid Supabase credentials
- [ ] Role switcher toggles Admin/Staff UI correctly
- [ ] Equipment cards/table render with real data
- [ ] Report Problem → creates ticket + notification
- [ ] Assign Tech → updates equipment + technician status
- [ ] Start Repair → ticket status "In Repair"
- [ ] Resolve Repair → maintenance record created, equipment "Working"
- [ ] Maintenance History → filters work, CSV exports
- [ ] Technician View → workload counts accurate
- [ ] Settings Modal → persists to database
- [ ] Notifications → mark read / mark all read
- [ ] Logout → redirects to login

---

## 🔮 Roadmap / Extensibility

| Feature | Effort | Notes |
|---------|--------|-------|
| **Supabase Realtime** | Low | Subscribe to equipment/ticket changes for live updates |
| **PDF Work Order Export** | Medium | Generate printable work orders for technicians |
| **Preventive Maintenance Scheduler** | Medium | Auto-generate PM work orders from `next_scheduled_maintenance` |
| **QR Code Asset Tags** | Low | Print equipment labels with QR linking to detail modal |
| **Mobile PWA** | Medium | Service worker + manifest for offline-first technician use |
| **RBAC via Supabase JWT** | Medium | Replace local role state with `app_metadata.role` claim |
| **Asset Lifecycle Costing** | High | TCO tracking, replacement planning, capital budgeting |
| **Integration: CMMS/ERP** | High | FHIR, HL7, or REST sync with hospital EHR/asset systems |

---

## 📄 License

Proprietary — Internal Clinical Engineering Tool.  
Contact Biomedical Engineering Department for access.

---

## 🤝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push branch: `git push origin feature/amazing-feature`
5. Open Pull Request

---

## 📞 Support

- **Biomedical Engineering Hotline**: Check Facility Settings
- **Clinical Engineering Email**: Check Facility Settings
- **System Administrator**: IT Service Desk

---

*Built for clinical excellence. Ensuring every device is ready when a patient needs it.*