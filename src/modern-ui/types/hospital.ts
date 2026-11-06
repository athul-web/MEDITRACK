export type ResourceTag = 'ICU' | 'Ventilator' | 'Oxygen' | '24/7 Trauma' | 'Burn Unit' | 'Emergency';

export interface HospitalResource {
  label: string;
  available: number;
  total: number;
  tag: ResourceTag;
}

export interface DemoHospital {
  id: string;
  name: string;
  verified: boolean;
  distanceKm: number | null;
  driveMinutes: number | null;
  address: string;
  district?: string;
  imageUrl: string;
  phone: string;
  lat: number;
  lng: number;
  tags: ResourceTag[];
  resources: HospitalResource[];
  lastUpdated: string; // ISO timestamp
}

export type ResourceFilter = 'All' | 'ICU' | 'Ventilator' | 'Oxygen' | 'Emergency';
export type QuickAccessTag = 'ICU' | 'Ventilator' | 'Oxygen' | '24/7 Trauma' | 'Burn Unit';
export type SortOption = 'Nearest' | 'Farthest' | 'Highest Availability' | 'Recently Updated';

export interface FilterState {
  resourceTypes: ('ICU' | 'Ventilator' | 'Oxygen' | 'Emergency')[];
  availabilityStatus: 'all' | 'available' | 'limited';
  maxDistanceKm: number | null; // null means any distance
  district: string | null;
}
