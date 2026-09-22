# MediTrack — Frontend Architecture

## 1. Architecture Goal

MediTrack is a public-facing healthcare resource discovery platform.

The current development phase focuses on building a polished, production-quality frontend UI.

Real hospital data, real-time resource availability, authentication, Supabase integration, GPS services, and IoT integrations will be connected later.

The architecture must therefore:

* Preserve the existing project structure where practical.
* Avoid unnecessary rewrites of working backend infrastructure.
* Separate UI components from data sources.
* Use mock data during the current UI development phase.
* Make the future transition from mock data to real APIs/Supabase straightforward.
* Keep healthcare resource states explicit and predictable.
* Avoid hard-coding hospital information inside visual components.
* Remain responsive across desktop, tablet, and mobile.

---

# 2. High-Level Architecture

```text
                         MediTrack
                             │
                             ▼
                    ┌─────────────────┐
                    │   Presentation  │
                    │       Layer     │
                    └────────┬────────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │   UI Components │
                    │   & Pages       │
                    └────────┬────────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │  Application    │
                    │     Layer       │
                    │                 │
                    │ Search / Filter │
                    │ Sorting         │
                    │ UI State        │
                    └────────┬────────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │   Data Access   │
                    │      Layer      │
                    └────────┬────────┘
                             │
                  ┌──────────┴──────────┐
                  │                     │
                  ▼                     ▼
          ┌───────────────┐     ┌────────────────┐
          │ Mock Data     │     │ Future Backend │
          │ CURRENT       │     │                │
          └───────────────┘     │ Supabase / API │
                                │ IoT / Realtime │
                                └────────────────┘
```

The UI must not directly depend on Supabase, IoT devices, or database queries.

---

# 3. Core Architectural Principle

## UI must be data-source independent.

Components should receive structured data through props/hooks rather than fetching database records directly.

### Correct

```tsx
<HospitalCard hospital={hospital} />
```

### Incorrect

```tsx
<HospitalCard />
```

with the component itself querying Supabase.

The HospitalCard should only care about displaying hospital information.

The data layer should decide where that information comes from.

---

# 4. Recommended Project Structure

Adapt this structure to the existing project instead of blindly replacing the entire repository.

```text
src/
│
├── app/
│   ├── routes/
│   │   ├── home/
│   │   ├── hospitals/
│   │   ├── about/
│   │   ├── contact/
│   │   └── hospital-details/
│   │
│   └── layout/
│
├── components/
│   │
│   ├── layout/
│   │   ├── Header
│   │   ├── Footer
│   │   └── MobileNavigation
│   │
│   ├── hero/
│   │   ├── HeroSection
│   │   ├── SearchConsole
│   │   └── EmergencyPresets
│   │
│   ├── hospitals/
│   │   ├── HospitalCard
│   │   ├── HospitalList
│   │   ├── HospitalHeader
│   │   ├── ResourceStatusGrid
│   │   ├── ResourceStatus
│   │   └── HospitalActions
│   │
│   ├── sidebar/
│   │   ├── EmergencyCallout
│   │   ├── HospitalPortalCard
│   │   └── MottoCard
│   │
│   ├── features/
│   │   └── FeatureGrid
│   │
│   └── ui/
│       ├── Button
│       ├── Badge
│       ├── Input
│       ├── Select
│       ├── Icon
│       └── LoadingState
│
├── data/
│   ├── mock/
│   │   ├── hospitals.ts
│   │   ├── emergencyTypes.ts
│   │   └── resources.ts
│   │
│   └── repositories/
│       └── hospitalRepository.ts
│
├── hooks/
│   ├── useHospitals
│   ├── useHospitalSearch
│   └── useLocation
│
├── types/
│   ├── hospital.ts
│   ├── resource.ts
│   ├── emergency.ts
│   └── search.ts
│
├── lib/
│   ├── utils
│   ├── constants
│   └── formatting
│
├── styles/
│   ├── globals
│   └── design-tokens
│
└── assets/
    ├── images/
    └── icons/
```

The exact folders should follow the framework already used by the project. Do not migrate frameworks merely to match this example.

---

# 5. Data Model

Even though real data is not being connected yet, define the data model now.

## Hospital

```ts
interface Hospital {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;

  distanceKm?: number;

  verified: boolean;

  image?: string;

  lastUpdated: string;

  resources: HospitalResources;

  contact: {
    phone?: string;
    emergencyPhone?: string;
  };

  coordinates?: {
    latitude: number;
    longitude: number;
  };
}
```

---

# 6. Hospital Resource Model

```ts
interface HospitalResources {
  emergencyDepartment: ResourceStatus;
  icu: ResourceStatus;
  ventilator: ResourceStatus;
  ctScan: ResourceStatus;
  blood: ResourceStatus;
}
```

Resource status must not be limited to boolean values.

Use:

```ts
type ResourceStatus =
  | "available"
  | "unavailable"
  | "unknown"
  | "stale";
```

This is important for the future real-time system.

A resource that has not been updated recently should not automatically be displayed as available.

---

# 7. Mock Data Architecture

During the current development phase:

```text
UI
 ↓
Hook
 ↓
Repository
 ↓
Mock Repository
 ↓
Mock Data
```

Example:

```ts
export async function getHospitals(): Promise<Hospital[]> {
  return mockHospitals;
}
```

The UI should never import `mockHospitals` directly.

### Incorrect

```tsx
import { mockHospitals } from "@/data/mock/hospitals";
```

inside a page/component.

### Correct

```tsx
const { hospitals } = useHospitals();
```

This makes future backend replacement much easier.

---

# 8. Repository Pattern

Create a small abstraction around hospital data.

```ts
interface HospitalRepository {
  getHospitals(): Promise<Hospital[]>;

  getHospitalById(
    id: string
  ): Promise<Hospital | null>;

  searchHospitals(
    filters: HospitalSearchFilters
  ): Promise<Hospital[]>;
}
```

Current implementation:

```text
MockHospitalRepository
```

Future implementations:

```text
SupabaseHospitalRepository
APIHospitalRepository
RealtimeHospitalRepository
```

The UI should not need to know which implementation is currently active.

---

# 9. Search Architecture

The homepage search console contains:

```text
Emergency Type
Required Resources
Location
Search
```

Represent this using a single search state.

```ts
interface HospitalSearchFilters {
  emergencyType?: EmergencyType;

  requiredResources: ResourceType[];

  location?: {
    latitude?: number;
    longitude?: number;
    label?: string;
  };
}
```

The search process should be:

```text
User Input
    ↓
Search State
    ↓
Validation
    ↓
Hospital Repository
    ↓
Filtered Results
    ↓
Hospital List
```

---

# 10. Emergency Presets

Presets are shortcuts that modify search state.

Example:

```ts
const emergencyPresets = [
  {
    id: "accident",
    label: "Accident / Trauma",
    resources: ["icu", "ventilator", "ctScan"],
  },

  {
    id: "heart",
    label: "Heart Emergency",
    resources: ["emergencyDepartment", "icu"],
  },

  {
    id: "breathing",
    label: "Breathing Crisis",
    resources: ["emergencyDepartment", "icu", "ventilator"],
  },

  {
    id: "burn",
    label: "Burn Injury",
    resources: ["emergencyDepartment", "icu"],
  },
];
```

These values are UI defaults only.

Clinical resource requirements must not be presented as medical protocols unless they are later validated by appropriate clinical/domain experts.

---

# 11. Hospital Results

The hospital results section should support:

* Search filtering
* Resource filtering
* Distance sorting
* Availability filtering
* Loading state
* Empty state
* Error state
* Stale-data state

Sorting should be represented independently from the data source.

```ts
type HospitalSort =
  | "nearest"
  | "availability"
  | "recentlyUpdated";
```

Do not implement ranking logic directly inside `HospitalCard`.

---

# 12. Hospital Card Architecture

The card is a presentation component.

```text
HospitalCard
│
├── Hospital Image
│
├── Hospital Identity
│   ├── Name
│   ├── Verification Indicator
│   ├── Distance
│   └── Address
│
├── Freshness Indicator
│
├── ResourceStatusGrid
│   ├── Emergency Department
│   ├── ICU
│   ├── Ventilator
│   ├── Blood
│   └── CT Scan
│
└── Actions
    ├── Call Hospital
    └── View Details
```

The card must not contain database queries.

---

# 13. Resource Status Display

Use explicit visual states.

### Available

```text
✓ Available
```

Color:

```text
#16A34A
```

### Unavailable

```text
✕ Unavailable
```

Color:

```text
#DC2626
```

### Unknown

```text
? Unknown
```

Use a neutral visual treatment.

### Stale

```text
! Data may be outdated
```

Do not visually represent stale information as currently available.

---

# 14. Freshness

Every real-time resource will eventually need a freshness timestamp.

Current mock data can use:

```ts
lastUpdated: "2 mins ago"
```

Future implementation should preferably use an actual timestamp:

```ts
lastUpdatedAt: "2026-09-22T09:42:00Z"
```

The frontend can then calculate:

```text
2 mins ago
12 mins ago
1 hour ago
Yesterday
```

Do not permanently store human-readable relative timestamps as the canonical database value.

---

# 15. Location Architecture

Current phase:

```text
Manual Location Input
        +
Mock Location Data
```

Future phase:

```text
Browser Geolocation
        ↓
Coordinates
        ↓
Reverse Geocoding
        ↓
Hospital Search
```

Location permissions must never be required simply to view the website.

Users should be able to manually search for a location.

---

# 16. Navigation

Primary navigation:

```text
Home
Hospitals
About
Contact
Hospital Staff Login
```

Public users should not require authentication to:

* Search hospitals
* View resource availability
* View hospital information
* Contact a hospital

Hospital staff authentication remains a separate workflow.

---

# 17. Future Authentication Boundary

Hospital Staff Login should be isolated from the public discovery experience.

Future architecture:

```text
Public Application
        │
        ├── Hospital Search
        ├── Hospital Details
        └── Public Information
       
Hospital Staff Portal
        │
        ├── Authentication
        ├── Hospital Dashboard
        ├── Resource Management
        ├── IoT Devices
        └── Data Verification
```

Do not introduce hospital staff permissions into every public UI component.

---

# 18. Future Supabase Integration

When real data is introduced:

```text
Frontend
   ↓
Repository
   ↓
Supabase
   ↓
PostgreSQL
   ↓
RLS / Authentication
```

The frontend architecture should not need to change significantly.

Only the repository/data implementation should change.

---

# 19. Future IoT Integration

IoT should not communicate directly with UI components.

Recommended architecture:

```text
Medical Equipment
      ↓
IoT Sensor
      ↓
Gateway / Device Service
      ↓
Backend
      ↓
Database / Realtime Layer
      ↓
Hospital Repository
      ↓
Frontend
```

The frontend receives normalized resource status.

Example:

```ts
{
  resource: "ventilator",
  status: "available",
  quantity: 4,
  lastUpdatedAt: "2026-09-22T09:42:00Z"
}
```

The UI should not care whether the value came from:

* Manual hospital entry
* IoT sensor
* External API
* Hospital information system

---

# 20. Design System Architecture

All visual components should use centralized design tokens.

## Brand

```text
brand-navy   #0E4366
brand-dark   #0B3553
brand-blue   #1877A9
brand-light  #EAF4F9
brand-subtle #DCEBF5
```

## Status

```text
available   #16A34A
unavailable #DC2626
```

## Neutral

```text
page          #F8FAFC
surface       #FFFFFF
text-primary  #0F172A
text-secondary #475569
text-muted    #64748B
border        #E2E8F0
```

Do not introduce arbitrary blue/green/red shades when an existing design token already fulfills the purpose.

---

# 21. Typography

The interface should prioritize:

* High readability
* Clear hierarchy
* Professional healthcare appearance
* Consistent font weights
* Strong numerical readability

Avoid excessive decorative typography.

Handwritten/cursive typography may be used only as a minor decorative element and never for critical medical/resource information.

---

# 22. Responsive Architecture

The interface must support:

```text
Mobile
Tablet
Desktop
Large Desktop
```

Desktop:

```text
Main Content + Sidebar
```

Mobile:

```text
Single Column
↓
Search
↓
Features
↓
Hospitals
↓
Emergency Information
↓
Hospital Portal
```

Hospital cards should not become horizontally compressed on small screens.

Actions should remain easily tappable.

---

# 23. Accessibility

The application should follow accessible UI practices.

Required:

* Semantic HTML
* Keyboard navigation
* Visible focus states
* Accessible labels
* Sufficient color contrast
* Touch-friendly controls
* Screen-reader-friendly status indicators
* Icons must not be the only source of meaning
* `aria-label` where appropriate

Resource status must communicate meaning through both text and visual styling.

---

# 24. Loading States

Every asynchronous data-driven section should have a loading state.

Example:

```text
Loading hospitals...
```

Use skeletons where appropriate.

Avoid rendering empty cards while data is loading.

---

# 25. Empty States

If no hospitals match the search:

```text
No matching hospitals found.

Try:
• Expanding your search area
• Removing a required resource
• Choosing another emergency type
```

Do not display fake hospital results as a fallback.

---

# 26. Error States

Example:

```text
We couldn't load hospital availability.

Please try again.
```

The error state should provide a retry action.

---

# 27. Current Development Scope

## Build Now

* Complete public homepage
* Header
* Hero
* Search console
* Emergency presets
* Feature section
* Hospital results
* Hospital cards
* Sidebar widgets
* Footer
* Responsive layouts
* Mock data
* Search/filter interactions
* Sorting interactions
* Loading states
* Empty states
* Error states
* Design system
* Accessibility

## Do Not Build Yet

* Real hospital database integration
* Real-time resource synchronization
* IoT integration
* Production authentication
* Live GPS backend
* Medical equipment APIs
* Production hospital verification
* Complex analytics
* Notification infrastructure

These will be added after the UI is finalized.

---

# 28. Architecture Rules for AI Coding Agents

The coding agent must follow these rules:

### Rule 1 — Do not redesign the entire existing application architecture.

Reuse working infrastructure whenever possible.

### Rule 2 — Do not create unnecessary dependencies.

Use the project's existing framework and libraries unless there is a concrete technical reason to introduce something new.

### Rule 3 — Separate data from UI.

Never hard-code hospital data inside components.

### Rule 4 — Use reusable components.

If the same visual pattern appears more than once, create a reusable component.

### Rule 5 — Do not duplicate design tokens.

Use the centralized design system.

### Rule 6 — Do not implement backend functionality prematurely.

The current goal is a polished frontend.

### Rule 7 — Keep future integration in mind.

Mock data should follow the same shape expected from the future backend.

### Rule 8 — Do not fake real-time behavior.

Mock data can visually demonstrate the interface, but the UI should not falsely imply that mock values are actually live.

### Rule 9 — Preserve existing working functionality.

Before changing an existing feature, inspect how it currently works.

### Rule 10 — Do not blindly overwrite files.

Inspect the existing project structure before making architectural changes.

---

# 29. Migration Strategy

The redesign should happen incrementally.

```text
Existing Application
        ↓
Inspect Existing Architecture
        ↓
Preserve Working Infrastructure
        ↓
Introduce Design Tokens
        ↓
Rebuild Public UI Components
        ↓
Connect Mock Data Layer
        ↓
Implement Search / Filters
        ↓
Implement Responsive Design
        ↓
Accessibility Review
        ↓
UI QA
        ↓
Finalize Frontend
        ↓
Connect Real Data
        ↓
Add Realtime
        ↓
Add IoT
```

Do not perform a full rewrite unless the existing architecture is technically incapable of supporting the new UI.

---

# 30. Definition of Done

The current UI architecture is complete when:

* The public homepage is visually polished.
* The interface does not look like a generic AI-generated dashboard.
* Components are reusable.
* Design tokens are centralized.
* Mock data is separated from presentation.
* Hospital cards consume typed data.
* Search and filtering work using mock data.
* Sorting works.
* Responsive layouts work.
* Loading, empty, and error states exist.
* Accessibility basics are implemented.
* No component directly depends on mock-data implementation details.
* Future Supabase/API integration can replace the repository without requiring a major UI rewrite.
* Existing working project functionality has not been unnecessarily destroyed.

---

# 31. Target Architecture

The final architecture should conceptually remain:

```text
                    ┌─────────────────────┐
                    │     MediTrack UI    │
                    └──────────┬──────────┘
                               │
                    ┌──────────▼──────────┐
                    │ Application / Hooks │
                    └──────────┬──────────┘
                               │
                    ┌──────────▼──────────┐
                    │ Hospital Repository │
                    └──────────┬──────────┘
                               │
                 ┌─────────────┴─────────────┐
                 │                           │
                 ▼                           ▼
          Mock Repository             Future Repository
          CURRENT PHASE              SUPABASE / API
                                             │
                                             ▼
                                      Realtime / IoT
```

The critical architectural boundary is:

**UI → Application Layer → Repository → Data Source**

Never:

**UI → Database**

This boundary allows MediTrack to evolve from a UI prototype into a real-time healthcare resource platform without requiring another frontend architectural rewrite.