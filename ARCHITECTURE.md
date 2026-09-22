# Hospital Web App — Architecture

## 1. Purpose

The Hospital Web App is the hospital-side application of the Healthcare Platform.

It allows a hospital user to manage medical equipment, equipment issues, maintenance records, equipment history, and connected IoT monitoring.

This application is the foundation for future components of the platform, including:

* Public Healthcare Web App
* Location-based hospital/resource discovery
* Emergency resource discovery
* Android application
* iOS application

These future systems are **not part of the current implementation phase**.

---

# 2. Current Development Scope

The current phase focuses exclusively on the **Hospital Web App**.

### Current priorities

1. Redesign the existing UI/UX.
2. Establish a clean and professional healthcare application structure.
3. Preserve useful existing functionality.
4. Simplify the user model to a single hospital-side role.
5. Maintain Supabase as the backend.
6. Maintain React + Vite as the frontend unless a strong technical reason requires otherwise.
7. Prepare the architecture for future IoT integration.

---

# 3. High-Level Architecture

```text
                         HOSPITAL WEB APP
                                │
                                ▼
                       ┌─────────────────┐
                       │    Frontend     │
                       │   React + Vite  │
                       └────────┬────────┘
                                │
                                ▼
                       ┌─────────────────┐
                       │ Application /   │
                       │ Business Logic  │
                       └────────┬────────┘
                                │
                                ▼
                       ┌─────────────────┐
                       │    Supabase     │
                       │    Backend      │
                       └────────┬────────┘
                                │
              ┌─────────────────┼─────────────────┐
              │                 │                 │
              ▼                 ▼                 ▼
          PostgreSQL       Supabase Auth      Storage
              │
              ▼
       Hospital Data
              │
      ┌───────┼────────┐
      │       │        │
      ▼       ▼        ▼
 Equipment  Issues  Maintenance
      │
      ▼
  IoT Devices
      │
      ▼
 Sensor Data
```

---

# 4. Technology Stack

## Frontend

* React
* TypeScript
* Vite
* Tailwind CSS
* Existing project component architecture where reusable

## Backend

* Supabase

## Database

* PostgreSQL through Supabase

## Authentication

* Supabase Authentication

## IoT

The IoT layer will be integrated progressively.

Potential hardware may include:

* ESP32-class microcontrollers
* Temperature sensors
* Humidity sensors
* Power/energy monitoring
* Equipment-state monitoring
* Connectivity monitoring

IoT hardware implementation will be developed separately from the initial UI redesign.

---

# 5. User Model

The new architecture uses **one hospital-side user role**.

## Hospital User

A hospital user can access the operational functionality of the hospital application.

They can:

* View equipment
* Add equipment
* Edit equipment information
* View equipment status
* Report equipment problems
* Track issues
* Manage maintenance records
* View equipment history
* View connected IoT devices
* View IoT monitoring data
* View hospital settings

There is no separate Staff/Admin role in the new architecture.

---

# 6. Hospital Data Isolation

Each authenticated hospital user must only be able to access data belonging to their hospital.

Conceptually:

```text
Hospital User
      │
      ▼
Authenticated Session
      │
      ▼
Hospital Identity
      │
      ▼
Hospital-Owned Data
      │
      ├── Equipment
      ├── Issues
      ├── Maintenance
      ├── History
      └── IoT Devices
```

A user from Hospital A must not be able to access private operational data belonging to Hospital B.

Database-level security must enforce this restriction.

Client-side checks alone are not considered sufficient security.

---

# 7. Application Structure

The Hospital Web App should contain the following primary areas:

```text
Hospital Web App
│
├── Authentication
│
├── Dashboard
│
├── Equipment
│   ├── Equipment List
│   ├── Equipment Details
│   ├── Add Equipment
│   └── Edit Equipment
│
├── Issues
│   ├── Issue List
│   ├── Report Issue
│   └── Issue Details
│
├── Maintenance
│   ├── Maintenance Records
│   └── Maintenance Details
│
├── Equipment History
│
├── IoT Monitoring
│   ├── IoT Devices
│   ├── Device Status
│   └── Sensor Data
│
└── Hospital Settings
```

The exact navigation can change during the UI redesign as long **as the underlying functionality remains accessible and logical**.

---

# 8. Dashboard

The dashboard provides a high-level operational overview of the hospital's equipment infrastructure.

The dashboard may display:

* Total equipment
* Operational equipment
* Equipment requiring attention
* Equipment under maintenance
* Open issues
* Connected IoT devices
* Offline IoT devices
* Recent equipment activity
* Recent maintenance activity
* Important alerts

The dashboard should prioritize information that requires attention.

It should not become an overloaded collection of unnecessary statistics.

---

# 9. Equipment Management

Equipment is the central entity of the Hospital Web App.

An equipment record may contain:

```text
Equipment
│
├── Equipment ID
├── Equipment Name
├── Equipment Type
├── Manufacturer
├── Model
├── Serial Number
├── Hospital ID
├── Department / Location
├── Operational Status
├── Maintenance Status
├── Installation Date
├── Last Maintenance Date
├── Next Maintenance Date
├── IoT Device ID
├── Created At
└── Updated At
```

Example:

```text
Equipment ID: ECG-001
Name: ECG Machine
Type: ECG
Location: Emergency Department
Operational Status: Operational
IoT Device: IOT-001
```

---

# 10. Equipment Status

Equipment status represents the current known operational state.

Possible states include:

```text
Operational
Under Maintenance
Faulty
Unavailable
Retired
```

The final status model should remain consistent throughout the application.

Status changes should be recorded in the equipment history where appropriate.

---

# 11. Issue Management

Hospital users can report problems with equipment.

The issue lifecycle is:

```text
Reported
   ↓
Assigned / Being Handled
   ↓
In Progress
   ↓
Resolved
   ↓
Closed
```

An issue may contain:

```text
Issue
│
├── Issue ID
├── Equipment ID
├── Description
├── Priority
├── Status
├── Reported By
├── Reported At
├── Resolution
└── Resolved At
```

Every issue should remain associated with the relevant equipment.

---

# 12. Maintenance Management

Maintenance records document maintenance activities performed on equipment.

Example:

```text
Equipment
    │
    ├── Maintenance Record
    ├── Maintenance Record
    └── Maintenance Record
```

A maintenance record may contain:

```text
Maintenance
│
├── Maintenance ID
├── Equipment ID
├── Maintenance Type
├── Description
├── Date
├── Status
├── Responsible Person
└── Notes
```

Maintenance activity should contribute to the equipment's history.

---

# 13. Equipment History

The application should maintain a chronological history of important equipment events.

Example:

```text
ECG-001

10:30 — Issue reported
11:15 — Issue being handled
13:00 — Maintenance started
14:20 — Maintenance completed
14:25 — Equipment marked operational
```

History provides traceability and helps hospital users understand the lifecycle of equipment.

---

# 14. IoT Architecture

IoT is a separate monitoring layer connected to the equipment system.

```text
Medical Equipment
       │
       ▼
Sensors / Monitoring Hardware
       │
       ▼
IoT Device
       │
       ▼
Network
       │
       ▼
Backend
       │
       ▼
Hospital Web App
```

The IoT layer may monitor:

* Power state
* Equipment operational state
* Temperature
* Humidity
* Connectivity
* Last-seen time
* Other appropriate equipment telemetry

IoT monitoring should support the hospital's equipment-management workflow rather than becoming a separate disconnected system.

---

# 15. IoT Device Association

Each IoT device should be associated with a specific equipment record.

Example:

```text
Equipment
ECG-001
    │
    └── IoT Device
          IOT-001
```

This allows sensor data to be associated with the correct equipment.

---

# 16. IoT Data

Sensor readings should be stored separately from the main equipment record.

Conceptually:

```text
IoT Device
     │
     └── Sensor Readings
            │
            ├── Temperature
            ├── Humidity
            ├── Power
            └── Equipment State
```

Sensor readings should include timestamps.

The system should support historical readings where required.

---

# 17. IoT Reliability

The system should distinguish between:

* Equipment failure
* IoT device failure
* Sensor failure
* Network failure
* Missing readings
* Invalid readings

For example:

```text
IOT-001

Status: Offline
Last Seen: 4 minutes ago
```

An IoT device becoming offline should **not automatically mean that the medical equipment itself has failed**.

The application should clearly communicate the difference.

---

# 18. Medical Equipment Safety

IoT monitoring must not interfere with the clinical operation of medical equipment.

For equipment connected to patients, IoT hardware must not be directly inserted into patient-side clinical signal paths without appropriate medical‑electrical safety, isolation, design, testing, and regulatory requirements.

For power monitoring, the project must use appropriate measurement and isolation circuitry.

The hackathon prototype should prioritize safe monitoring and simulation where direct equipment integration is not appropriate.

---

# 19. Database Architecture

Supabase PostgreSQL is the primary database.

The logical relationship is:

```text
Hospital
   │
   ├── Users
   │
   ├── Equipment
   │      │
   │      ├── Issues
   │      ├── Maintenance
   │      ├── History
   │      └── IoT Device
   │                 │
   │                 └── Sensor Readings
   │
   └── Hospital Settings
```

---

# 20. Core Database Entities

The new system should conceptually contain:

```text
Hospitals
Users
Equipment
Issues
Maintenance
Equipment History
IoT Devices
Sensor Readings
Notifications
Hospital Settings
```

The existing database schema should be evaluated against this model before major database changes are made.

The old database schema is not automatically considered the final schema.

---

# 21. Authentication

Supabase Authentication is responsible for:

* Login
* Logout
* Session management
* Authentication state
* Protected routes

Only authenticated hospital users should access the internal Hospital Web App.

---

# 22. Authorization and Security

Security should be enforced primarily at the backend/database level.

Requirements include:

* Authentication
* Hospital-level data isolation
* Row-Level Security
* Secure API communication
* Input validation
* Secure IoT communication
* IoT device authentication
* Audit/history tracking
* Protection of sensitive operational information

Client-side role or permission checks may improve UX but must not be treated as the primary security mechanism.

---

# 23. Frontend Architecture

The frontend should use reusable components and clear separation between:

```text
Pages
Components
UI Components
Data / Services
Types
Utilities
Authentication
```

A conceptual structure:

```text
src/
│
├── components/
│
├── pages/
│
├── components/ui/
│
├── lib/
│
├── services/
│
├── types/
│
├── hooks/
│
└── App / Routing
```

The exact folder structure may be adapted to the existing codebase where doing so reduces unnecessary rewriting.

---

# 24. Data Access Layer

The application should avoid scattering complex database operations throughout UI components.

Database operations should be organized into reusable service/helper functions where practical.

For example:

```text
UI Component
     ↓
Service / Data Layer
     ↓
Supabase
     ↓
PostgreSQL
```

This makes future integration with other applications easier.

---

# 25. UI/UX Architecture

The Hospital Web App is undergoing a complete UI/UX redesign.

The new design should feel like a professional healthcare operations product.

It should prioritize:

* Clear information hierarchy
* Consistent typography
* Consistent spacing
* Professional visual language
* Clear navigation
* Clear equipment status
* Efficient workflows
* Responsive layouts
* Accessibility
* Loading states
* Empty states
* Error states
* Confirmation states

The UI should not look like a generic AI‑generated dashboard.

Visual design should support the workflow instead of adding decorative elements without functional value.

---

# 26. Existing Codebase Reuse

The existing repository is an **older implementation**.

Existing code should be treated as reusable implementation material rather than the source of truth.

Potentially reusable elements include:

* React/Vite setup
* Supabase configuration
* Authentication implementation
* Equipment data models
* Equipment components
* Issue functionality
* Maintenance functionality
* Existing data‑access helpers
* Useful UI primitives

However, existing components should be redesigned or rewritten where necessary to match this architecture and the new UI/UX direction.

Old Staff/Admin‑specific functionality should not automatically be preserved.

---

# 27. Old Functionality That Should Not Define the New Architecture

The following old concepts are not part of the new architecture unless explicitly reintroduced:

* Separate Staff role
* Separate Admin role
* Technician role as a separate application role
* Old ECG login animation
* Old dashboard structure
* Old navigation structure
* Old branding
* Old assumptions about hospital permissions

Existing code implementing these concepts should be evaluated during migration.

---

# 28. Current UI Redesign Priority

The first implementation stage is the UI redesign.

Recommended order:

```text
1. Global Design System
        ↓
2. Application Shell / Navigation
        ↓
3. Dashboard
        ↓
4. Equipment
        ↓
5. Issues
        ↓
6. Maintenance
        ↓
7. Equipment History
        ↓
8. IoT Monitoring
        ↓
9. Settings
        ↓
10. Responsive / Accessibility Refinement
```

The goal is to redesign the interface while preserving working functionality wherever possible.

---

# 29. Future Architecture

The Hospital Web App is one component of a larger future platform.

Future architecture:

```text
                         HEALTHCARE PLATFORM
                                │
              ┌─────────────────┼─────────────────┐
              │                 │                 │
              ▼                 ▼                 ▼
       Hospital Web       Public Web          Mobile Apps
           App               App              Android/iOS
              │                 │                 │
              └─────────────────┼─────────────────┘
                                │
                         Shared Backend
                           / Database
                                │
                         ┌──────┴──────┐
                         │             │
                    Hospital Data   IoT Data
```

The current Hospital Web App should therefore expose clean and controlled data structures that can later support these systems.

---

# 30. Public Data Separation

The future Public Web App must not directly expose private hospital operational data.

Conceptually:

```text
Hospital Internal Data
        │
        ▼
Controlled Public Data Layer
        │
        ▼
Public Web App
```

Examples of potentially public information:

* Hospital name
* General location
* Public contact information
* Approved availability information

Private information such as internal maintenance notes, detailed equipment faults, sensor telemetry, security information, or patient information must remain protected.

This is a future requirement and is not part of the current Hospital Web App implementation.

---

# 31. Future Emergency Resource Discovery

A future public system may support:

```text
User Location
      ↓
Nearby Hospitals
      ↓
Relevant Healthcare Resources
      ↓
Availability Information
      ↓
Hospital Details
      ↓
Directions / Contact
```

This is intentionally outside the current Hospital Web App implementation.

The current architecture only needs to ensure that hospital data can eventually support this functionality.

---

# 32. Development Principles

The project should follow these principles:

### 1. Do not overbuild

Only implement features that serve the current project requirements.

### 2. Reuse before rewriting

Existing working functionality should be reused when it fits the new architecture.

### 3. Architecture before features

New functionality should follow the architecture rather than forcing the architecture to change unnecessarily.

### 4. Security by design

Sensitive hospital data must be protected at the backend/database level.

### 5. Clear separation

Hospital-private data and future public data must remain separated.

### 6. IoT should support the workflow

IoT should provide useful equipment information rather than becoming an isolated hardware demonstration.

### 7. Professional UI

The application should prioritize usability, clarity, consistency, and healthcare‑oriented workflows.

### 8. Future‑ready, not future‑bloated

The current system should be capable of expanding into the larger platform without implementing future features prematurely.

---

# 33. Current Implementation Goal

The immediate goal is:

```text
Existing Hospital Web App
          ↓
Understand Existing Code
          ↓
Apply New Architecture
          ↓
Redesign UI/UX
          ↓
Preserve Useful Functionality
          ↓
Clean Database Model
          ↓
Stable Hospital Web App
          ↓
IoT Integration
          ↓
Future Public Web App
          ↓
Future Mobile Applications
```

The Hospital Web App should become the stable foundation of the larger Healthcare Platform.

---

# 34. Source of Truth

For future development:

```text
PROJECT.md
    +
ARCHITECTURE.md
    ↓
AUTHORITATIVE PROJECT REQUIREMENTS
```

The existing source code is an implementation that can be reused, modified, or replaced according to these documents.

If existing code conflicts with `PROJECT.md` or `ARCHITECTURE.md`, the documented new architecture takes priority.

---
