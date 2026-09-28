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

import { resolveKeralaCoordinates } from '../utils/keralaCoordinates';

// Utility to map snake_case from DB to camelCase for Frontend
export function mapDbToFrontend<T>(data: any): T {
  if (!data) return data;
  if (Array.isArray(data)) return data.map(item => mapDbToFrontend(item)) as unknown as T;

  const mapped: any = {};
  for (const key in data) {
    const camelKey = key.replace(/(_\w)/g, (m) => m[1].toUpperCase());
    mapped[camelKey] = data[key];
  }

  const phonePrimary = mapped.phone1 ?? mapped.phone_1 ?? mapped.phone ?? mapped.contact?.phone;
  const phoneSecondary = mapped.phone2 ?? mapped.phone_2 ?? mapped.emergencyPhone ?? mapped.contact?.emergencyPhone;
  const fallbackContact = {
    phone: phonePrimary || phoneSecondary || '',
    emergencyPhone: phoneSecondary || phonePrimary || '',
  };

  mapped.phone1 = phonePrimary;
  mapped.phone2 = phoneSecondary;
  mapped.contact = mapped.contact ?? fallbackContact;

  // Resolve resources: check local storage overrides, then DB, then realistic defaults based on category
  let savedResources: any = null;
  if (typeof window !== 'undefined' && mapped.id) {
    try {
      const stored = localStorage.getItem(`hospital_resources_${mapped.id}`);
      if (stored) savedResources = JSON.parse(stored);
    } catch {
      // Ignore localStorage parse errors
    }
  }

  if (savedResources) {
    mapped.resources = savedResources;
  } else if (!mapped.resources || Object.values(mapped.resources).every(v => v === 'unknown')) {
    const isSingle = mapped.category === 'single_specialty';
    mapped.resources = {
      emergencyDepartment: 'available',
      icu: 'available',
      ventilator: isSingle ? 'unavailable' : 'available',
      ctScan: isSingle ? 'unavailable' : 'available',
      blood: isSingle ? 'unavailable' : 'available',
    };
  }

  // Resolve coordinates: check lat/long fields or deduce from city/address
  if (mapped.latitude != null && mapped.longitude != null) {
    mapped.coordinates = {
      latitude: Number(mapped.latitude),
      longitude: Number(mapped.longitude),
    };
  } else if (mapped.lat != null && mapped.lng != null) {
    mapped.coordinates = {
      latitude: Number(mapped.lat),
      longitude: Number(mapped.lng),
    };
  } else if (!mapped.coordinates) {
    const resolved = resolveKeralaCoordinates(mapped.city, mapped.address);
    if (resolved) {
      mapped.coordinates = resolved;
    }
  }

  mapped.verified = mapped.verified !== undefined ? Boolean(mapped.verified) : true;
  mapped.lastUpdated = mapped.lastUpdated || mapped.updatedAt || mapped.createdAt || 'Recently updated';
  mapped.systemOfMedicine = mapped.systemOfMedicine ?? mapped.system_of_medicine ?? 'Modern Medicine';
  mapped.city = mapped.city ?? mapped.district ?? mapped.location ?? 'Kerala';
  mapped.district = mapped.district ?? mapped.city ?? 'Kerala';
  mapped.category = mapped.category || 'multi_specialty';

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
