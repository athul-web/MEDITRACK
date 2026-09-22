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

export interface Hospital {
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

export interface EmergencyType {
  id: string;
  label: string;
  resources: ResourceType[];
  icon: string;
}

export interface HospitalSearchFilters {
  emergencyType?: string;
  requiredResources: ResourceType[];
  location?: {
    latitude?: number;
    longitude?: number;
    label?: string;
  };
}

export type HospitalSort = 'nearest' | 'availability' | 'recentlyUpdated';