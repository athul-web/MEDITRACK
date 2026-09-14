import { createClient } from '@supabase/supabase-js';

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
