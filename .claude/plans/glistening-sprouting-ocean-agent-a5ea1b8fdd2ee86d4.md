# Implementation Plan: Migrate Equipment Uptime App to Supabase

## 1. Database Schema Design

### 1.1 Custom Types (Enums)
We will use check constraints or dedicated type definitions in Postgres for the following:
- equipment_status: 'Working', 'Down', 'Under Maintenance', 'Needs Attention'
- criticality_level: 'Life Support', 'Critical Diagnostic', 'Patient Monitoring', 'General Clinical'
- ticket_severity: 'Critical', 'High', 'Medium', 'Low'
- ticket_status: 'Reported', 'Assigned', 'In Repair', 'Resolved'
- department_type: 'Intensive Care Unit (ICU)', 'Emergency Department (ED)', 'Radiology & Imaging', 'Cardiology', 'Operating Rooms (OR)', 'Central Sterile Supply (CSSD)', 'Clinical Laboratory', 'Oncology & Infusion', 'Neonatal ICU (NICU)'
- maintenance_type: 'Corrective Repair', 'Preventive Maintenance', 'Calibration', 'Inspection'
- notification_type: 'alert', 'warning', 'info', 'success'
- user_role: 'Staff', 'Admin'

### 1.2 Table Definitions

#### profiles
- id: uuid (PK, references auth.users)
- user_role: text (check: 'Staff', 'Admin')
- updated_at: timestamp with time zone

#### technicians
- id: uuid (PK)
- name: text
- title: text
- email: text
- phone: text
- specialty: text
- status: text (check: 'Available', 'Assigned', 'On Call', 'Off Duty')
- active_tickets_count: int
- certifications: text[]

#### equipment
- id: text (PK)
- name: text
- model: text
- manufacturer: text
- serial_number: text
- department: text (check: department_type)
- room: text
- status: text (check: equipment_status)
- criticality: text (check: criticality_level)
- install_date: date
- last_maintenance_date: date
- next_scheduled_maintenance: date
- assigned_technician_id: uuid (FK to technicians.id)
- active_ticket_id: uuid (FK to problem_reports.id)
- uptime_percentage: numeric
- total_downtime_hours: numeric
- specifications: jsonb

#### problem_reports
- id: uuid (PK)
- equipment_id: text (FK to equipment.id)
- department: text (check: department_type)
- room: text
- severity: text (check: ticket_severity)
- status: text (check: ticket_status)
- reported_by: text
- reported_role: text
- reported_at: timestamp with time zone
- issue_description: text
- assigned_technician_id: uuid (FK to technicians.id)
- assigned_at: timestamp with time zone
- repair_notes: text[]
- resolved_at: timestamp with time zone
- resolution_summary: text
- parts_used: text[]
- downtime_hours: numeric

#### maintenance_records
- id: uuid (PK)
- equipment_id: text (FK to equipment.id)
- date: date
- type: text (check: maintenance_type)
- technician_id: uuid (FK to technicians.id)
- description: text
- parts_replaced: text[]
- downtime_hours: numeric
- cost: numeric
- resolved_date: timestamp with time zone
- notes: text

#### notifications
- id: uuid (PK)
- title: text
- message: text
- type: text (check: notification_type)
- timestamp: timestamp with time zone
- equipment_id: text (FK to equipment.id)
- read: boolean default false

#### facility_settings
- id: int (PK)
- hospital_name: text
- facility_code: text
- sla_critical_hours: int
- sla_high_hours: int
- primary_contact_phone: text
- maintenance_email: text

## 2. Supabase Auth & RLS

### 2.1 Profile Trigger
Create a Postgres trigger to automatically create a profiles entry when a new user signs up via Supabase Auth.

### 2.2 RLS Policies
- Equipment:
  - SELECT: All authenticated users.
  - INSERT/UPDATE/DELETE: profiles.user_role = 'Admin'.
- Technicians:
  - SELECT: All authenticated users.
  - INSERT/UPDATE/DELETE: profiles.user_role = 'Admin'.
- Problem Reports:
  - SELECT: All authenticated users.
  - INSERT: All authenticated users.
  - UPDATE/DELETE: profiles.user_role = 'Admin'.
- Maintenance Records:
  - SELECT: All authenticated users.
  - INSERT/UPDATE/DELETE: profiles.user_role = 'Admin'.
- Notifications:
  - SELECT: User specific.
  - INSERT/UPDATE/DELETE: profiles.user_role = 'Admin'.
- Facility Settings:
  - SELECT: All authenticated users.
  - UPDATE: profiles.user_role = 'Admin'.

## 3. Application Integration

### 3.1 Setup
1. Install @supabase/supabase-js.
2. Create .env with VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.
3. Implement src/lib/supabase.ts.

### 3.2 App.tsx Refactoring

#### Initial Data Loading
Replace useState(INITIAL_...) with useState([]) and use a useEffect to fetch all data on mount.

#### Refactoring Handlers
All handlers in App.tsx will become async.

1. handleSubmitProblemReport:
   - insert into problem_reports
   - update equipment status and active_ticket_id
   - insert notification

2. handleAssignTechnician:
   - update equipment status and technician_id
   - update problem_report status and technician_id
   - update technician status and active_tickets_count
   - insert notification

3. handleResolveRepair:
   - insert into maintenance_records
   - update problem_report status and resolution details
   - update equipment status to Working and clear ticket/tech
   - insert notification

4. handleUpdateStatus:
   - update equipment status
   - insert notification

5. handleSaveEquipment:
   - upsert equipment

## 4. Data Migration (Seeding)
An SQL script will be provided to insert the initial mock data.

## 5. Step-by-Step Implementation Sequence
1. Environment Setup
2. Database Provisioning (Schema, RLS, Seed)
3. State Management Transition (useEffect)
4. Handler Migration (Async Supabase calls)
5. Verification

### Critical Files for Implementation
- src/lib/supabase.ts
- src/App.tsx
- src/types.ts
- .env
