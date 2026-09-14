# MetroHealth Medical Equipment Management System

## Overview

This project is a React + TypeScript dashboard for managing hospital medical equipment, maintenance workflows, technician assignments, and repair tracking. It is designed to support a clinical operations workflow where staff and biomedical administrators can:

- monitor the equipment fleet
- report equipment issues
- assign technicians
- resolve repairs and log maintenance history
- track uptime and maintenance risk
- manage facility settings and notifications

The application is built as a single-page web app with a hospital operations interface and mock data for a realistic healthcare environment.

---

## Tech Stack

- React 19
- TypeScript
- Vite
- Lucide React icons
- Tailwind-style utility classes for UI styling
- Local mock data for realistic demo content

---

## Project Structure

```text
health-care-v2/
├── index.html
├── metadata.json
├── package.json
├── README.md
├── PROJECT.md
├── tsconfig.json
├── vite.config.ts
├── src/
│   ├── App.tsx
│   ├── index.css
│   ├── main.tsx
│   ├── types.ts
│   ├── components/
│   │   ├── AddEditEquipmentModal.tsx
│   │   ├── AssignTechModal.tsx
│   │   ├── EquipmentCard.tsx
│   │   ├── EquipmentDetailModal.tsx
│   │   ├── EquipmentTable.tsx
│   │   ├── Header.tsx
│   │   ├── MaintenanceHistoryView.tsx
│   │   ├── ReportProblemModal.tsx
│   │   ├── ResolveRepairModal.tsx
│   │   ├── SettingsModal.tsx
│   │   ├── StatsOverview.tsx
│   │   ├── StatusBadge.tsx
│   │   ├── TechniciansView.tsx
│   │   └── WorkOrdersView.tsx
│   └── data/
│       └── mockData.ts
```

---

## Core Features

### 1. Equipment Fleet Dashboard
The main screen provides a hospital fleet overview with:

- search by equipment name, ID, model, serial number, department, or room
- department filtering
- criticality filtering
- card or table view toggle
- quick status updates
- equipment detail modal

### 2. Work Order Management
Staff can create problem reports for equipment issues. Those reports are tracked as work orders and include:

- severity level
- reported by user information
- room and department context
- assignment to a technician
- repair notes
- resolution summary and downtime tracking

### 3. Maintenance History
The maintenance history view shows prior service records including:

- repair type
- technician name
- date
- parts replaced
- downtime hours
- incident cost
- notes and compliance details

### 4. Technician Management
The biomedical team view includes:

- technician profiles
- specialties and certifications
- current assignment status
- active ticket counts
- ability to filter equipment by assigned technician

### 5. Role-Based Workflow
The app supports two user roles:

- Staff: can report issues and monitor equipment
- Admin: has access to administrative operations like adding equipment and resetting settings

### 6. Facility Settings and Notifications
The app includes:

- notification center
- read/unread notification indicators
- facility info such as hospital name, contact number, and SLA settings
- data reset to demo defaults

---

## Application Flow

### Main user journey

1. A staff member searches or views equipment.
2. A device issue is reported through the reporting modal.
3. The equipment status changes to a degraded state.
4. A biomedical technician is assigned.
5. Repair work is recorded in the work order.
6. The maintenance record is created once resolved.
7. The equipment returns to operational status and the notification feed updates.

---

## Key State and Data Model

The app centralizes core operational data in `src/App.tsx`:

- `equipmentList`
- `technicians`
- `problemReports`
- `maintenanceRecords`
- `notifications`
- `facilitySettings`
- `currentRole`
- `activeNav`
- `viewMode`
- `searchQuery`
- filter states
- modal open states

The core types are defined in `src/types.ts` and include:

- `Equipment`
- `Technician`
- `ProblemReport`
- `MaintenanceRecord`
- `NotificationItem`
- `FacilitySettings`
- `EquipmentStatus`
- `TicketSeverity`
- `UserRole`

---

## Mock Data

The dataset is seeded in `src/data/mockData.ts` and includes:

- hospital departments
- medical equipment inventory
- active and historical work orders
- maintenance logs
- technician roster
- facility settings
- notifications

This makes the app immediately runnable without a backend while still demonstrating realistic healthcare maintenance workflows.

---

## Important Components

### `src/App.tsx`
This is the main application controller. It contains the primary logic for:

- data state management
- fleet calculations
- filtering and search logic
- report creation
- technician assignment
- repair resolution
- modal orchestration
- notification handling

### `src/components/Header.tsx`
Displays the global app header, role selector, notifications, and uptime summary.

### `src/components/StatsOverview.tsx`
Shows metric cards such as total equipment count, downtime categories, and operational health.

### `src/components/EquipmentCard.tsx`
Displays each equipment item in the card grid view.

### `src/components/EquipmentTable.tsx`
Displays equipment in a compact tabular format for admin or operational review.

### `src/components/EquipmentDetailModal.tsx`
Provides a detailed drill-down modal for a specific equipment item, including its status, ticket, and maintenance history.

### `src/components/WorkOrdersView.tsx`
Shows all ongoing and historical work orders for the facility.

### `src/components/MaintenanceHistoryView.tsx`
Shows the complete history of equipment maintenance and repair work.

### `src/components/TechniciansView.tsx`
Shows technicians, their workload, certifications, and assignment data.

### `src/components/ReportProblemModal.tsx`
Marks an issue report for a piece of equipment.

### `src/components/AssignTechModal.tsx`
Assigns a technician to a repair task.

### `src/components/ResolveRepairModal.tsx`
Closes a repair, logs downtime, and saves repair details.

### `src/components/SettingsModal.tsx`
Allows editing facility settings and resetting mock data.

---

## Run Instructions

### Prerequisites

- Node.js installed locally

### Install dependencies

```bash
npm install
```

### Start the application

```bash
npm run dev
```

This starts the Vite server, typically on port 3000.

### Build for production

```bash
npm run build
```

### Type-checking

```bash
npm run lint
```

---

## Notes on the Current Implementation

- This project is a demo healthcare operations dashboard.
- Data is local and in-memory; there is no backend or persistent database.
- It is ideal for UI prototyping, front-end workflow demonstration, and operational dashboard mockups.
- The app is structured so it can later be extended with real APIs, authentication, and persistent storage.

---

## Summary

This project represents a hospital equipment lifecycle management interface with realistic operational flows for biomedical engineering teams. It combines fleet monitoring, service request handling, maintenance history, technician dispatching, and admin oversight in a single polished dashboard.

It is well-suited for demonstrating front-end engineering skills, workflow design, and healthcare operations simulation.
