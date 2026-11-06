import { EmergencyType } from '../types/public';

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
    label: 'Breathing / Respiratory',
    resources: ['emergencyDepartment', 'icu', 'ventilator'],
    icon: 'lungs',
  },
  {
    id: 'burn',
    label: 'Severe Burn',
    resources: ['emergencyDepartment', 'icu'],
    icon: 'flame',
  },
];
