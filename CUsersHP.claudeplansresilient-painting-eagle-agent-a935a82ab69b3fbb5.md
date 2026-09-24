# Implementation Plan: Connecting Home Search to Hospital Directory

## Goal
Replace the static search UI on the Home page with functional components (`SearchConsole`, `EmergencyPresets`) and enable navigation to the `/hospitals` page while preserving search filters via URL parameters.

## Technical Approach

### 1. URL Parameter Strategy
To pass search state from `HomePage` to `HospitalsPage`, we will use URL query parameters.

**Parameter Mapping:**
- `emergencyType`: Maps to `filters.emergencyType` (string).
- `resources`: Maps to `filters.requiredResources` (comma-separated string).
- `location`: For the purpose of this phase, we will primarily pass the `label` if available.

**Serialization (Home $\rightarrow$ Hospitals):**
- `filters.emergencyType` $\rightarrow$ `?emergencyType=heart`
- `filters.requiredResources` $\rightarrow$ `?resources=icu,ventilator`

**Deserialization (Hospitals $\rightarrow$ state):**
- `emergencyType` $\rightarrow$ `filters.emergencyType`
- `resources` (split by `,`) $\rightarrow$ `filters.requiredResources`

### 2. Home Page Integration (`HomePage.tsx`)
- **Remove**: The static HTML mockup for the search box and quick tag pills.
- **Add**:
    - `SearchConsole` and `EmergencyPresets` components.
    - Local state to manage `HospitalSearchFilters` and `selectedPreset`.
    - `useNavigate` from `react-router-dom` to handle the search submission.
- **Logic**:
    - Update `SearchConsole` to accept an `onSearch` prop or handle the button click via a passed-in function.
    - When the search button is clicked, construct the query string and navigate to `/hospitals?params...`.
    - When a preset is selected via `EmergencyPresets`, update the local filters state.

### 3. Hospitals Page Integration (`HospitalsPage.tsx`)
- **Add**: `useSearchParams` from `react-router-dom` to read parameters on mount.
- **Logic**:
    - In a `useEffect` (or during state initialization), check for `emergencyType` and `resources` parameters.
    - Parse the `resources` string into an array of `ResourceType`.
    - Initialize `searchFilters` and `selectedPreset` based on these parameters.
    - Ensure the `HospitalList` (which uses `useHospitals`) receives these initial filters to trigger the first API call with the correct criteria.

### 4. Verification Steps
1. **Basic Navigation**: Navigate from Home to Hospitals without filters $\rightarrow$ should show all hospitals.
2. **Preset Search**: Select "Heart Emergency" on Home $\rightarrow$ Click Search $\rightarrow$ Hospitals page should be filtered by ICU and Emergency Dept.
3. **Custom Search**: Select specific resources (e.g., CT Scan, Blood) on Home $\rightarrow$ Click Search $\rightarrow$ Hospitals page should show only those with specified resources.
4. **Direct URL Access**: Manually enter `/hospitals?resources=icu,blood` $\rightarrow$ Page should load with those filters active.
5. **Persistence**: Ensure manual filtering on the Hospitals page still works and does not conflict with the initial URL state.

## Critical Files for Implementation
- `src/app/routes/home/HomePage.tsx`
- `src/app/routes/hospitals/HospitalsPage.tsx`
- `src/components/hero/SearchConsole.tsx`
- `src/types/public.ts`
