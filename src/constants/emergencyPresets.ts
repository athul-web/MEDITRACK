export const emergencyPresets = [
  {
    id: 'accident',
    label: 'Accident / Trauma',
    resources: ['icu', 'ventilator', 'ctScan'],
  },
  {
    id: 'heart',
    label: 'Heart Emergency',
    resources: ['emergencyDepartment', 'icu'],
  },
  {
    id: 'breathing',
    label: 'Breathing / Respiratory',
    resources: ['emergencyDepartment', 'icu', 'ventilator'],
  },
  {
    id: 'burn',
    label: 'Severe Burn',
    resources: ['emergencyDepartment', 'icu'],
  },
];
