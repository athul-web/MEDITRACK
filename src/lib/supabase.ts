import { createClient } from '@supabase/supabase-js';
import type {
  Equipment,
  MaintenanceRecord,
  NotificationItem,
  ProblemReport,
} from '../types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Supabase URL and Anon Key are required. Please check your .env file.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Utility to map snake_case from DB to camelCase for Frontend
export function mapDbToFrontend<T>(data: any): T {
  if (!data) return data;
  if (Array.isArray(data)) return data.map(mapDbToFrontend);

  const mapped: any = {};
  for (const key in data) {
    const camelKey = key.replace(/(_\w)/g, (m) => m[1].toUpperCase());
    mapped[camelKey] = data[key];
  }
  return mapped;
}

// Utility to map camelCase from Frontend to snake_case for DB
export function mapFrontendToDb(data: any): any {
  if (!data) return data;
  if (Array.isArray(data)) return data.map(mapFrontendToDb);

  const mapped: any = {};
  for (const key in data) {
    const snakeKey = key.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
    mapped[snakeKey] = data[key];
  }
  return mapped;
}

/**
 * The UI includes a few display-only fields assembled from relations. Keep
 * them out of writes so PostgREST only receives real table columns.
 */
export function toEquipmentRow(equipment: Equipment) {
  const { assignedTechnicianName: _assignedTechnicianName, ...row } = equipment;
  return mapFrontendToDb(row);
}

export function toProblemReportRow(report: ProblemReport) {
  const {
    equipmentName: _equipmentName,
    assignedTechnicianName: _assignedTechnicianName,
    ...row
  } = report;
  return mapFrontendToDb(row);
}

export function toMaintenanceRecordRow(record: MaintenanceRecord) {
  const {
    equipmentName: _equipmentName,
    technicianName: _technicianName,
    ...row
  } = record;
  return mapFrontendToDb(row);
}

export function toNotificationRow(notification: Omit<NotificationItem, 'id'>) {
  return mapFrontendToDb(notification);
}
