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
  if (Array.isArray(data)) return data.map(item => mapDbToFrontend(item)) as unknown as T;

  const mapped: any = {};
  for (const key in data) {
    const camelKey = key.replace(/(_\w)/g, (m) => m[1].toUpperCase());
    mapped[camelKey] = data[key];
  }
  return mapped as unknown as T;
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

/**
 * Get the current authenticated user's hospital_id from their profile.
 * Returns the hospital_id if the user is authenticated and has a profile with a hospital_id.
 * Throws an error with a user-friendly message if not authenticated or no profile/hospital_id.
 */
export async function getCurrentUserHospitalId(): Promise<string> {
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError) throw userError;
  if (!user) throw new Error('Not authenticated. Please sign in to register equipment.');

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('hospital_id')
    .eq('id', user.id)
    .maybeSingle();

  if (profileError) throw profileError;
  if (!profile) throw new Error('User profile not found. Please contact your administrator.');
  if (!profile.hospital_id) throw new Error('Your account is not associated with a hospital. Please contact your administrator.');

  return profile.hospital_id;
}
