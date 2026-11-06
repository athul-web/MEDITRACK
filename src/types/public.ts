/**
 * Public-facing types for MediTrack homepage.
 * These are separate from the hospital staff portal types in types.ts.
 */

export type ResourceStatus = 'available' | 'unavailable' | 'unknown' | 'stale';

export type ResourceType =
  | 'emergencyDepartment'
  | 'icu'
  | 'ventilator'
  | 'ctScan'
  | 'blood';

export interface HospitalResources {
  emergencyDepartment: ResourceStatus;
  icu: ResourceStatus;
  ventilator: ResourceStatus;
  ctScan: ResourceStatus;
  blood: ResourceStatus;
}

export type HospitalCategory = 'multi_specialty' | 'single_specialty';

export interface Hospital {
  id: string;
  name: string;
  category: HospitalCategory;
  address: string;
  district: string;
  city?: string;
  state?: string;
  phone1?: string;
  phone2?: string;
  email?: string;
  systemOfMedicine?: string;
  createdAt?: string;
  updatedAt?: string;
  /** Driving distance in km ('road') or a flagged straight-line estimate ('estimate'). */
  distanceKm?: number;
  /** Driving time in minutes. Only present when distanceSource is 'road'. */
  durationMin?: number;
  distanceSource?: 'road' | 'estimate';
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
  /** True when coordinates were guessed from city/address (town or district centre). */
  coordinatesApproximate?: boolean;
}

export interface EmergencyType {
  id: string;
  label: string;
  resources: ResourceType[];
  icon: string;
}

export interface HospitalSearchFilters {
  emergencyType?: string;
  requiredResources: ResourceType[];
  district?: string;
  category?: HospitalCategory;
  query?: string;
  location?: {
    latitude?: number;
    longitude?: number;
    label?: string;
  };
}

export type HospitalSort = 'nearest' | 'availability' | 'recentlyUpdated';
