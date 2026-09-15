import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type {
  Equipment,
  MaintenanceRecord,
  NotificationItem,
  ProblemReport,
} from '../types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL?.trim();
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim();

/**
 * Configuration problems are reported as a value instead of being thrown while
 * this module is evaluated. createClient() throws synchronously on a missing or
 * malformed URL, and a throw here aborts the whole module graph before
 * main.tsx can mount React -- which renders a blank page with no explanation.
 */
function describeConfigProblem(): string | null {
  const missing = [
    !supabaseUrl && 'VITE_SUPABASE_URL',
    !supabaseAnonKey && 'VITE_SUPABASE_ANON_KEY',
  ].filter(Boolean);

  if (missing.length > 0) {
    return `Supabase is not configured: ${missing.join(' and ')} missing. Copy .env.example to .env, fill both values, then restart the dev server.`;
  }

  if (!/^https?:\/\//i.test(supabaseUrl!)) {
    return 'Supabase is not configured: VITE_SUPABASE_URL must be the project root URL including https:// (for example https://your-project-ref.supabase.co).';
  }

  return null;
}

export const supabaseConfigError = describeConfigProblem();

if (supabaseConfigError) {
  console.error(supabaseConfigError);
}

/**
 * When the configuration is invalid there is no client to hand out. Any access
 * raises the real configuration error, so App.tsx's existing error handling
 * surfaces it in the UI rather than the app dying before it can render.
 */
const unconfiguredClient = () =>
  new Proxy({} as SupabaseClient, {
    get() {
      throw new Error(supabaseConfigError!);
    },
  });

export const supabase: SupabaseClient = supabaseConfigError
  ? unconfiguredClient()
  : createClient(supabaseUrl!, supabaseAnonKey!);

// Utility to map snake_case from DB to camelCase for Frontend
export function mapDbToFrontend<T>(data: any): T {
  if (!data) return data;
  if (Array.isArray(data)) return data.map(item => mapDbToFrontend(item)) as T;

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
