/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL?: string;
  readonly VITE_SUPABASE_ANON_KEY?: string;
  /** Base URL of the OSRM server, e.g. https://router.project-osrm.org (default). */
  readonly VITE_OSRM_BASE_URL?: string;
  /** Base URL of the Nominatim server (default: the public OSM instance). */
  readonly VITE_NOMINATIM_BASE_URL?: string;
  /** Contact email sent to Nominatim, as its usage policy asks. */
  readonly VITE_NOMINATIM_EMAIL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
