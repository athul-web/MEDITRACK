export type EquipmentStatus = 'Working' | 'Down' | 'Under Maintenance' | 'Needs Attention';

export type CriticalityLevel = 'Life Support' | 'Critical Diagnostic' | 'Patient Monitoring' | 'General Clinical';

export type TicketSeverity = 'Critical' | 'High' | 'Medium' | 'Low';

export type TicketStatus = 'Reported' | 'Assigned' | 'In Repair' | 'Resolved';

export type Department = 
  | 'Intensive Care Unit (ICU)'
  | 'Emergency Department (ED)'
  | 'Radiology & Imaging'
  | 'Cardiology'
  | 'Operating Rooms (OR)'
  | 'Central Sterile Supply (CSSD)'
  | 'Clinical Laboratory'
  | 'Oncology & Infusion'
  | 'Neonatal ICU (NICU)';

export interface MaintenanceRecord {
  id: string;
  equipmentId: string;
  equipmentName: string;
  date: string;
  type: 'Corrective Repair' | 'Preventive Maintenance' | 'Calibration' | 'Inspection';
  technicianName: string;
  technicianId?: string;
  description: string;
  partsReplaced?: string[];
  downtimeHours: number;
  cost?: number;
  resolvedDate: string;
  notes?: string;
}

export interface ProblemReport {
  id: string;
  equipmentId: string;
  equipmentName: string;
  department: Department;
  room: string;
  severity: TicketSeverity;
  status: TicketStatus;
  reportedBy: string;
  reportedRole: string;
  reportedAt: string;
  issueDescription: string;
  assignedTechnicianId?: string;
  assignedTechnicianName?: string;
  assignedAt?: string;
  repairNotes?: string[];
  resolvedAt?: string;
  resolutionSummary?: string;
  partsUsed?: string[];
  downtimeHours?: number;
}

export interface Equipment {
  id: string;
  name: string;
  model: string;
  manufacturer: string;
  serialNumber: string;
  department: Department;
  room: string;
  status: EquipmentStatus;
  criticality: CriticalityLevel;
  installDate: string;
  lastMaintenanceDate: string;
  nextScheduledMaintenance: string;
  assignedTechnicianId?: string;
  assignedTechnicianName?: string;
  activeTicketId?: string;
  uptimePercentage: number;
  totalDowntimeHours: number;
  specifications?: Record<string, string>;
}

export interface Technician {
  id: string;
  name: string;
  title: string;
  email: string;
  phone: string;
  specialty: string;
  status: 'Available' | 'Assigned' | 'On Call' | 'Off Duty';
  activeTicketsCount: number;
  certifications: string[];
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: 'alert' | 'warning' | 'info' | 'success';
  timestamp: string;
  equipmentId?: string;
  read: boolean;
}

// UserRole removed; single hospital-side user model now applies universally

export interface FacilitySettings {
  hospitalName: string;
  facilityCode: string;
  slaCriticalHours: number;
  slaHighHours: number;
  primaryContactPhone: string;
  maintenanceEmail: string;
}
