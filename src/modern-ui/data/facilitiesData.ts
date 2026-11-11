// Frontend-only demo facilities & equipment dataset.
// Not connected to any backend or database.

export interface DemoFacility {
  id: string;
  name: string;
  /** e.g. "Operational", "Under Maintenance", "Closed" */
  status: 'operational' | 'maintenance' | 'closed';
  description: string;
  capacity?: string; // e.g. "30 beds"
  floor?: string;    // e.g. "Ground Floor"
  icon: string;      // emoji used as a lightweight icon
}

export interface DemoEquipment {
  id: string;
  name: string;
  category: string;
  status: 'available' | 'in_use' | 'maintenance';
  quantity: number;
  description: string;
  icon: string;
}

export const DEMO_FACILITIES: DemoFacility[] = [
  {
    id: 'fac-01',
    name: 'Emergency Department',
    status: 'operational',
    description: '24/7 emergency care with dedicated trauma bays, resuscitation rooms, and triage zones.',
    capacity: '20 bays',
    floor: 'Ground Floor',
    icon: '🚨',
  },
  {
    id: 'fac-02',
    name: 'Intensive Care Unit (ICU)',
    status: 'operational',
    description: 'State-of-the-art ICU with continuous patient monitoring, ventilator support, and specialist nursing.',
    capacity: '20 beds',
    floor: '2nd Floor',
    icon: '🏥',
  },
  {
    id: 'fac-03',
    name: 'Operation Theatre Complex',
    status: 'operational',
    description: 'Fully equipped modular OTs with HEPA filtration, laminar airflow, and C-arm imaging support.',
    capacity: '6 OTs',
    floor: '3rd Floor',
    icon: '⚕️',
  },
  {
    id: 'fac-04',
    name: 'Radiology & Imaging Centre',
    status: 'operational',
    description: 'Advanced diagnostic imaging including MRI, CT scan, digital X-ray, and ultrasound.',
    floor: 'Ground Floor',
    icon: '🔬',
  },
  {
    id: 'fac-05',
    name: 'Pathology & Laboratory',
    status: 'operational',
    description: 'NABL-accredited lab offering haematology, biochemistry, microbiology, and histopathology services.',
    floor: '1st Floor',
    icon: '🧪',
  },
  {
    id: 'fac-06',
    name: 'Pharmacy',
    status: 'operational',
    description: '24-hour in-house pharmacy stocking essential and specialty medications.',
    floor: 'Ground Floor',
    icon: '💊',
  },
  {
    id: 'fac-07',
    name: 'Neonatal ICU (NICU)',
    status: 'operational',
    description: 'Specialised care for premature and critically ill newborns with incubators and phototherapy units.',
    capacity: '12 beds',
    floor: '2nd Floor',
    icon: '👶',
  },
  {
    id: 'fac-08',
    name: 'Physiotherapy & Rehabilitation',
    status: 'operational',
    description: 'Comprehensive rehabilitation services including electrotherapy, hydrotherapy, and occupational therapy.',
    floor: '1st Floor',
    icon: '🏃',
  },
  {
    id: 'fac-09',
    name: 'Blood Bank',
    status: 'operational',
    description: 'Licensed blood bank with component separation, cross-matching, and 24/7 supply.',
    floor: 'Ground Floor',
    icon: '🩸',
  },
  {
    id: 'fac-10',
    name: 'Dialysis Centre',
    status: 'maintenance',
    description: 'Haemodialysis and peritoneal dialysis services. Currently undergoing scheduled maintenance.',
    capacity: '10 stations',
    floor: '1st Floor',
    icon: '🔄',
  },
];

export const DEMO_EQUIPMENT: DemoEquipment[] = [
  {
    id: 'eq-01',
    name: 'MRI Scanner (3 Tesla)',
    category: 'Imaging',
    status: 'available',
    quantity: 1,
    description: 'High-field 3T MRI for neurological, musculoskeletal, and cardiac imaging.',
    icon: '🧲',
  },
  {
    id: 'eq-02',
    name: 'CT Scanner (128-Slice)',
    category: 'Imaging',
    status: 'in_use',
    quantity: 2,
    description: 'Multi-detector CT for rapid trauma, cardiac, and oncology imaging.',
    icon: '📡',
  },
  {
    id: 'eq-03',
    name: 'Mechanical Ventilator',
    category: 'Critical Care',
    status: 'available',
    quantity: 18,
    description: 'ICU-grade ventilators supporting invasive and non-invasive ventilation modes.',
    icon: '💨',
  },
  {
    id: 'eq-04',
    name: 'Cardiac Monitor (12-Lead ECG)',
    category: 'Cardiology',
    status: 'available',
    quantity: 24,
    description: 'Continuous multi-parameter bedside monitoring with arrhythmia detection.',
    icon: '❤️',
  },
  {
    id: 'eq-05',
    name: 'Defibrillator / AED',
    category: 'Emergency',
    status: 'available',
    quantity: 10,
    description: 'Biphasic defibrillators deployed across emergency, ICU, and wards.',
    icon: '⚡',
  },
  {
    id: 'eq-06',
    name: 'Anaesthesia Workstation',
    category: 'Surgery',
    status: 'available',
    quantity: 6,
    description: 'Integrated anaesthesia machines with vaporisers, ventilators, and monitoring.',
    icon: '😴',
  },
  {
    id: 'eq-07',
    name: 'Digital X-Ray System',
    category: 'Imaging',
    status: 'available',
    quantity: 4,
    description: 'Computed radiography (CR) and direct radiography (DR) units for instant digital X-rays.',
    icon: '☢️',
  },
  {
    id: 'eq-08',
    name: 'Ultrasound Machine',
    category: 'Imaging',
    status: 'in_use',
    quantity: 6,
    description: 'Portable and console ultrasound units for OB/GYN, abdominal, and vascular imaging.',
    icon: '📻',
  },
  {
    id: 'eq-09',
    name: 'Infusion Pump',
    category: 'Critical Care',
    status: 'available',
    quantity: 50,
    description: 'Smart infusion pumps with drug-error reduction software for precise IV delivery.',
    icon: '💉',
  },
  {
    id: 'eq-10',
    name: 'Haemodialysis Machine',
    category: 'Nephrology',
    status: 'maintenance',
    quantity: 10,
    description: 'High-flux dialysis machines. Under scheduled preventive maintenance.',
    icon: '🔄',
  },
  {
    id: 'eq-11',
    name: 'Laparoscopy Tower',
    category: 'Surgery',
    status: 'available',
    quantity: 3,
    description: 'Full HD laparoscopy stack for minimally invasive surgical procedures.',
    icon: '🎥',
  },
  {
    id: 'eq-12',
    name: 'Pulse Oximeter',
    category: 'Monitoring',
    status: 'available',
    quantity: 60,
    description: 'Bedside and finger-clip SpO₂ monitors across all wards and ICU.',
    icon: '📊',
  },
];

export const EQUIPMENT_CATEGORIES = [
  'All Categories',
  'Imaging',
  'Critical Care',
  'Cardiology',
  'Emergency',
  'Surgery',
  'Nephrology',
  'Monitoring',
];

// ── Services data ─────────────────────────────────────────────────────────────

export interface DemoService {
  id: string;
  name: string;
  category: string;
  available: boolean;
  hours: string;        // e.g. "24 / 7" or "Mon–Sat, 8 AM – 8 PM"
  description: string;
  icon: string;
}

export const DEMO_SERVICES: DemoService[] = [
  {
    id: 'svc-01',
    name: 'Outpatient Department (OPD)',
    category: 'General',
    available: true,
    hours: 'Mon – Sat, 8 AM – 6 PM',
    description: 'Walk-in and appointment-based consultations across all specialties. Token system available at reception.',
    icon: '🏨',
  },
  {
    id: 'svc-02',
    name: '24 / 7 Emergency Care',
    category: 'Emergency',
    available: true,
    hours: '24 / 7',
    description: 'Round-the-clock emergency services with trained paramedics, trauma rooms, and rapid triage.',
    icon: '🚨',
  },
  {
    id: 'svc-03',
    name: 'Ambulance Service',
    category: 'Emergency',
    available: true,
    hours: '24 / 7',
    description: 'Fleet of ALS and BLS ambulances equipped with cardiac monitors, defibrillators, and oxygen supply.',
    icon: '🚑',
  },
  {
    id: 'svc-04',
    name: 'Inpatient & Ward Admission',
    category: 'General',
    available: true,
    hours: '24 / 7',
    description: 'General, semi-private, and private wards. Admission desk open round the clock.',
    icon: '🛏️',
  },
  {
    id: 'svc-05',
    name: 'Surgical Services',
    category: 'Surgery',
    available: true,
    hours: 'Scheduled + Emergency',
    description: 'Elective and emergency surgeries including laparoscopic, orthopaedic, cardiac, and gynaecological procedures.',
    icon: '⚕️',
  },
  {
    id: 'svc-06',
    name: 'Diagnostic Imaging',
    category: 'Diagnostics',
    available: true,
    hours: 'Mon – Sun, 7 AM – 10 PM',
    description: 'MRI, CT scan, digital X-ray, ultrasound, and mammography. Reports within 2–4 hours for routine scans.',
    icon: '🔬',
  },
  {
    id: 'svc-07',
    name: 'Laboratory & Pathology',
    category: 'Diagnostics',
    available: true,
    hours: '24 / 7',
    description: 'NABL-accredited lab. Online report delivery via patient portal and WhatsApp.',
    icon: '🧪',
  },
  {
    id: 'svc-08',
    name: 'Telemedicine / Video Consultation',
    category: 'Digital Health',
    available: true,
    hours: 'Mon – Sat, 9 AM – 5 PM',
    description: 'Remote consultations with specialist doctors. Book via the MediTrack app or hospital website.',
    icon: '💻',
  },
  {
    id: 'svc-09',
    name: 'Maternity & Delivery',
    category: "Women's Health",
    available: true,
    hours: '24 / 7',
    description: 'Antenatal care, normal and C-section deliveries, and postnatal support in dedicated maternity suites.',
    icon: '👶',
  },
  {
    id: 'svc-10',
    name: 'Physiotherapy & Rehabilitation',
    category: 'Rehabilitation',
    available: true,
    hours: 'Mon – Sat, 8 AM – 5 PM',
    description: 'Post-surgery and post-stroke rehabilitation, sports injury management, and geriatric physiotherapy.',
    icon: '🏃',
  },
  {
    id: 'svc-11',
    name: 'Dietary & Nutrition Counselling',
    category: 'Wellness',
    available: true,
    hours: 'Mon – Fri, 9 AM – 4 PM',
    description: 'Personalised meal planning and therapeutic diet support for diabetic, cardiac, and renal patients.',
    icon: '🥗',
  },
  {
    id: 'svc-12',
    name: 'Medical Social Work',
    category: 'Support',
    available: true,
    hours: 'Mon – Sat, 9 AM – 5 PM',
    description: 'Guidance on government health schemes, insurance claims, discharge planning, and community support.',
    icon: '🤝',
  },
  {
    id: 'svc-13',
    name: 'Health Packages & Preventive Checkups',
    category: 'Wellness',
    available: true,
    hours: 'Mon – Sat, 7 AM – 2 PM',
    description: 'Annual health packages covering full blood panel, ECG, chest X-ray, BMI, and physician consultation.',
    icon: '📋',
  },
  {
    id: 'svc-14',
    name: 'Haemodialysis',
    category: 'Nephrology',
    available: false,
    hours: 'Temporarily unavailable',
    description: 'Haemodialysis sessions for chronic kidney disease patients. Currently suspended due to equipment maintenance.',
    icon: '🔄',
  },
];

export const SERVICE_CATEGORIES = [
  'All',
  'General',
  'Emergency',
  'Surgery',
  'Diagnostics',
  'Digital Health',
  "Women's Health",
  'Rehabilitation',
  'Wellness',
  'Support',
  'Nephrology',
];

// ── Overview quick-stats ───────────────────────────────────────────────────────

export interface OverviewStat {
  label: string;
  value: string;
  icon: string;
}

export const OVERVIEW_STATS: OverviewStat[] = [
  { label: 'Total Beds',         value: '350+',    icon: '🛏️' },
  { label: 'Specialist Doctors', value: '80+',     icon: '👨‍⚕️' },
  { label: 'Surgeries / Year',   value: '5,000+',  icon: '⚕️'  },
  { label: 'Established',        value: '1998',    icon: '🏥'  },
];

export const OVERVIEW_ACCREDITATIONS = [
  { name: 'NABH Accredited',    icon: '🏅' },
  { name: 'NABL Certified Lab', icon: '🔬' },
  { name: 'ISO 9001:2015',      icon: '✅' },
  { name: 'AERB Approved',      icon: '☢️' },
];

export const OVERVIEW_TIMINGS = [
  { day: 'Mon – Fri', time: '8 AM – 8 PM' },
  { day: 'Saturday',  time: '8 AM – 6 PM' },
  { day: 'Sunday',    time: '9 AM – 2 PM (OPD)' },
  { day: 'Emergency', time: '24 / 7' },
];
