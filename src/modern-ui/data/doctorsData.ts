export type DoctorAvailability = 'available' | 'on_duty' | 'unavailable';

export interface DemoDoctor {
  id: string;
  name: string;
  specialization: string;
  department: string;
  availability: DoctorAvailability;
  imageUrl: string;
  qualification?: string;
  experience?: string;
  bio?: string;
}

export const DEMO_DOCTORS: DemoDoctor[] = [
  // Required 4
  {
    id: 'd1',
    name: 'Dr. Anna Mathew',
    specialization: 'General Physician',
    department: 'General Medicine',
    availability: 'available',
    imageUrl: 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=200&h=200&fit=crop&crop=face',
    qualification: 'MBBS, MD (Internal Medicine)',
    experience: '12 years',
    bio: 'Dr. Anna Mathew specializes in preventive care and manages complex multi-system conditions with a patient-centered approach.',
  },
  {
    id: 'd2',
    name: 'Dr. Rajesh Kumar',
    specialization: 'Cardiologist',
    department: 'Cardiology',
    availability: 'available',
    imageUrl: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=200&h=200&fit=crop&crop=face',
    qualification: 'MBBS, MD (Cardiology), DM',
    experience: '18 years',
    bio: 'Dr. Rajesh Kumar is a senior cardiologist with expertise in interventional cardiology and cardiac electrophysiology.',
  },
  {
    id: 'd3',
    name: 'Dr. Varghese Thomas',
    specialization: 'Pulmonologist',
    department: 'Pulmonology',
    availability: 'available',
    imageUrl: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=200&h=200&fit=crop&crop=face',
    qualification: 'MBBS, MD (Respiratory Medicine)',
    experience: '15 years',
    bio: 'Dr. Varghese Thomas focuses on chronic respiratory conditions, sleep disorders, and critical respiratory management.',
  },
  {
    id: 'd4',
    name: 'Dr. Priya Nair',
    specialization: 'Critical Care Specialist',
    department: 'Critical Care',
    availability: 'on_duty',
    imageUrl: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=200&h=200&fit=crop&crop=face',
    qualification: 'MBBS, MD (Anaesthesia), IDCCM',
    experience: '10 years',
    bio: 'Dr. Priya Nair leads the ICU team and specializes in multi-organ failure management and advanced ventilator care.',
  },
  // 8 additional doctors
  {
    id: 'd5',
    name: 'Dr. Suresh Pillai',
    specialization: 'Neurologist',
    department: 'Neurology',
    availability: 'available',
    imageUrl: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=200&h=200&fit=crop&crop=face',
    qualification: 'MBBS, MD (Neurology), DM',
    experience: '14 years',
    bio: 'Dr. Suresh Pillai is an expert in stroke management and neurodegenerative disorders.',
  },
  {
    id: 'd6',
    name: 'Dr. Deepa Krishnan',
    specialization: 'Pediatrician',
    department: 'Pediatrics',
    availability: 'on_duty',
    imageUrl: 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=200&h=200&fit=crop&crop=face',
    qualification: 'MBBS, DCH, MD (Pediatrics)',
    experience: '9 years',
    bio: 'Dr. Deepa Krishnan provides compassionate care for newborns, children, and adolescents.',
  },
  {
    id: 'd7',
    name: 'Dr. Arun Menon',
    specialization: 'Orthopedic Surgeon',
    department: 'Orthopedics',
    availability: 'available',
    imageUrl: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=200&h=200&fit=crop&crop=face',
    qualification: 'MBBS, MS (Orthopaedics)',
    experience: '16 years',
    bio: 'Dr. Arun Menon specializes in joint replacement surgeries and sports injury rehabilitation.',
  },
  {
    id: 'd8',
    name: 'Dr. Lakshmi Iyer',
    specialization: 'Dermatologist',
    department: 'Dermatology',
    availability: 'unavailable',
    imageUrl: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=200&h=200&fit=crop&crop=face',
    qualification: 'MBBS, MD (Dermatology)',
    experience: '8 years',
    bio: 'Dr. Lakshmi Iyer treats a wide range of skin conditions and performs advanced cosmetic dermatology procedures.',
  },
  {
    id: 'd9',
    name: 'Dr. Santhosh George',
    specialization: 'Gynecologist',
    department: 'Gynecology',
    availability: 'on_duty',
    imageUrl: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=200&h=200&fit=crop&crop=face',
    qualification: 'MBBS, MS (Obstetrics & Gynaecology)',
    experience: '13 years',
    bio: 'Dr. Santhosh George specializes in high-risk obstetrics and minimally invasive gynecological procedures.',
  },
  {
    id: 'd10',
    name: 'Dr. Meera Chandran',
    specialization: 'General Physician',
    department: 'General Medicine',
    availability: 'available',
    imageUrl: 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=200&h=200&fit=crop&crop=face',
    qualification: 'MBBS, MD (Internal Medicine)',
    experience: '7 years',
    bio: 'Dr. Meera Chandran focuses on early diagnosis and evidence-based treatment of infectious and lifestyle diseases.',
  },
  {
    id: 'd11',
    name: 'Dr. Biju Abraham',
    specialization: 'Cardiologist',
    department: 'Cardiology',
    availability: 'on_duty',
    imageUrl: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=200&h=200&fit=crop&crop=face',
    qualification: 'MBBS, MD, DM (Cardiology)',
    experience: '20 years',
    bio: 'Dr. Biju Abraham has extensive experience in emergency cardiac care and complex angioplasty procedures.',
  },
  {
    id: 'd12',
    name: 'Dr. Nisha Rajan',
    specialization: 'Pediatric Intensivist',
    department: 'Critical Care',
    availability: 'unavailable',
    imageUrl: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=200&h=200&fit=crop&crop=face',
    qualification: 'MBBS, MD (Pediatrics), Fellowship in PICU',
    experience: '11 years',
    bio: 'Dr. Nisha Rajan manages critically ill children in the PICU with expertise in pediatric emergency protocols.',
  },
];

export const DEPARTMENTS = [
  'All Departments',
  'General Medicine',
  'Cardiology',
  'Pulmonology',
  'Neurology',
  'Orthopedics',
  'Pediatrics',
  'Dermatology',
  'Gynecology',
  'Critical Care',
];
