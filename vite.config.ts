import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const missing = ['VITE_SUPABASE_URL', 'VITE_SUPABASE_ANON_KEY']
    .filter(name => !env[name]?.trim());

  if (missing.length > 0) {
    throw new Error(
      `Missing required Supabase environment variable(s): ${missing.join(', ')}. ` +
      'Set them in .env for local builds or in Vercel Project Settings for deployments.',
    );
  }

  if (!/^https?:\/\//i.test(env.VITE_SUPABASE_URL.trim())) {
    throw new Error(
      'VITE_SUPABASE_URL must be the Supabase project root URL, including https:// and without /rest/v1.',
    );
  }

  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
