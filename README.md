# MediTrack - Hospital Resource Tracking System

MediTrack is a real-time hospital resource tracking system that helps users find nearby hospitals with verified emergency resources like ICU, ventilators, CT scans, and blood availability.

## Features

### Home Page Search
The home page features an intelligent search console that helps users find hospitals based on:
- **Emergency Type**: Select from presets (Accident/Trauma, Heart Emergency, Breathing/Respiratory, Severe Burn) which automatically configure required resources
- **Hospital Category**: Filter by Multi-Specialty or Single-Specialty hospitals
- **Required Resources**: Multi-select specific resources needed (Emergency Dept, ICU, Ventilator, CT Scan, Blood)
- **Location**: Enter a location manually or use automatic geolocation

### Automatic Geolocation on Search
When users click the **Search** button:
1. If a location is already set (manual entry or previous geolocation), it uses that location
2. If no location is set, it **automatically requests the user's current location** via browser geolocation API
3. If geolocation succeeds, it searches for nearest hospitals with the required emergency resources
4. If geolocation fails (permissions denied, not supported, timeout), it shows an error message but **still allows the search to proceed** with other filters

### Hospital Directory Page
The Hospitals page (`/hospitals`) provides:
- Full search and filter capabilities in a sidebar
- Paginated, sortable hospital list
- Sort by: Nearest, Most Available, Recently Updated
- Real-time resource availability status
- Direct call and directions links

### Emergency Presets
Quick-select emergency types that automatically configure the required resources:
- **Accident / Trauma** → ICU, Ventilator, CT Scan
- **Heart Emergency** → Emergency Department, ICU
- **Breathing / Respiratory** → Emergency Department, ICU, Ventilator
- **Severe Burn** → Emergency Department, ICU

## Technical Stack
- **Frontend**: React 19, TypeScript, Vite
- **Styling**: Tailwind CSS with CSS Variables
- **Routing**: React Router v7
- **Backend**: Supabase (PostgreSQL)
- **Maps/Location**: Browser Geolocation API
- **Icons**: Lucide React

## Project Structure
```
src/
├── app/routes/
│   ├── home/HomePage.tsx       # Home page with search console
│   └── hospitals/HospitalsPage.tsx  # Hospital directory with filters
├── components/
│   ├── hero/
│   │   ├── SearchConsole.tsx   # Main search component (horizontal/vertical variants)
│   │   └── EmergencyPresets.tsx # Emergency type quick-select pills
│   ├── hospitals/
│   │   ├── HospitalList.tsx    # Paginated, sortable hospital list
│   │   └── HospitalCard.tsx    # Individual hospital display card
│   └── ...
├── hooks/
│   └── useHospitals.ts         # React hook for hospital data fetching
├── data/repositories/
│   ├── hospitalRepository.ts   # Repository interface
│   └── supabaseHospitalRepository.ts  # Supabase implementation with distance calculation
├── services/
│   └── hospitalService.ts      # Legacy service (being phased out)
├── types/public.ts             # Shared TypeScript types
├── constants/
│   └── emergencyPresets.ts     # Emergency type configurations
└── utils/
    ├── distance.ts             # Haversine distance calculation
    └── keralaCoordinates.ts    # Kerala district coordinates for fallback
```

## Key Implementation Details

### Search Console (`SearchConsole.tsx`)
- **Two variants**: `horizontal` (home page hero) and `vertical` (hospitals page sidebar)
- **Responsive layouts**: Desktop (single row), Tablet (3-column grid), Mobile (single column stack)
- **Auto-geolocation**: New `onSearchWithLocation` prop handles automatic location detection on search
- **Error handling**: Geolocation errors display inline without blocking search
- **Removed**: District dropdown (replaced by geolocation)

### Distance-Based Sorting
The `SupabaseHospitalRepository.searchHospitals()` method:
1. Accepts user coordinates (from geolocation or district fallback)
2. Calculates Haversine distance to each hospital
3. Sorts results by nearest first (default)
4. Falls back to district centroid coordinates when exact location unavailable

### Emergency Type → Resource Mapping
Defined in `emergencyPresets.ts`, each emergency type maps to specific required resources. Selecting an emergency type auto-populates the required resources multi-select.

## Recent Updates (September 2026)

### Search UX Improvements
1. **Removed District Dropdown** - Replaced with automatic geolocation for more accurate "nearest" results
2. **Auto-Geolocation on Search Click** - When user clicks Search without a location set, the app automatically requests browser location
3. **Graceful Geolocation Failure** - If location access is denied or unavailable, search still works with other filters; error message shown inline
4. **Updated HomePage** - Integrated new `onSearchWithLocation` callback to trigger geolocation before navigation
5. **Updated HospitalsPage** - Search console in sidebar uses vertical variant with same auto-geolocation behavior

### Search Flow
```
User clicks Search
    ↓
Has location with coordinates? → Use it
    ↓ No
Has location label only? → Use it (text search)
    ↓ No
Request browser geolocation
    ↓ Success
Update filters with coordinates → Search
    ↓ Failure
Show inline error → Search with other filters only
```

## Environment Variables
Create a `.env` file with:
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Development
```bash
npm install
npm run dev
```

## Build
```bash
npm run build
```

## License
MIT