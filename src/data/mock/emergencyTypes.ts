/**
 * Emergency preset types for UI development.
 * Per DESIGN.md §12
 */

import { EmergencyType } from '../../types/public';

export const emergencyPresets: EmergencyType[] = [
  {
    id: 'accident',
    label: 'Accident / Trauma',
    resources: ['icu', 'ventilator', 'ctScan'],
    icon: 'car',
  },
  {
    id: 'heart',
    label: 'Heart Emergency',
    resources: ['emergencyDepartment', 'icu'],
    icon: 'heart',
  },
  {
    id: 'breathing',
    label: 'Breathing Crisis',
    resources: ['emergencyDepartment', 'icu', 'ventilator'],
    icon: 'wind',
  },
  {
    id: 'burn',
    label: 'Burn Injury',
    resources: ['emergencyDepartment', 'icu'],
    icon: 'flame',
  },
];