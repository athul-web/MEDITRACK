/**
 * Mock hospital data for UI development.
 * Per architecture.md: UI should never import this directly.
 * Use the repository layer instead.
 */

import { Hospital } from '../../types/public';

export const mockHospitals: Hospital[] = [
  {
    id: 'hosp-001',
    name: 'City General Hospital',
    address: 'MG Road',
    city: 'Kochi',
    state: 'Kerala',
    distanceKm: 2.8,
    verified: true,
    image: 'https://images.unsplash.com/photo-1587351021759-3e566b5f5b3f?w=400&h=250&fit=crop',
    lastUpdated: '2 mins ago',
    resources: {
      emergencyDepartment: 'available',
      icu: 'available',
      ventilator: 'available',
      ctScan: 'available',
      blood: 'available',
    },
    contact: {
      phone: '+91 484 236 0000',
      emergencyPhone: '108',
    },
    coordinates: {
      latitude: 9.9312,
      longitude: 76.2673,
    },
  },
  {
    id: 'hosp-002',
    name: 'Metro Medical Center',
    address: 'NH Bypass',
    city: 'Kochi',
    state: 'Kerala',
    distanceKm: 4.1,
    verified: true,
    image: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=400&h=250&fit=crop',
    lastUpdated: '12 mins ago',
    resources: {
      emergencyDepartment: 'available',
      icu: 'available',
      ventilator: 'unavailable',
      ctScan: 'available',
      blood: 'available',
    },
    contact: {
      phone: '+91 484 272 1234',
      emergencyPhone: '108',
    },
    coordinates: {
      latitude: 9.9678,
      longitude: 76.3124,
    },
  },
  {
    id: 'hosp-003',
    name: 'Saint Jude Medical Center',
    address: 'Kaloor',
    city: 'Kochi',
    state: 'Kerala',
    distanceKm: 5.4,
    verified: false,
    image: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=400&h=250&fit=crop',
    lastUpdated: '28 mins ago',
    resources: {
      emergencyDepartment: 'available',
      icu: 'available',
      ventilator: 'available',
      ctScan: 'unavailable',
      blood: 'available',
    },
    contact: {
      phone: '+91 484 240 5678',
      emergencyPhone: '108',
    },
    coordinates: {
      latitude: 10.0012,
      longitude: 76.2987,
    },
  },
];