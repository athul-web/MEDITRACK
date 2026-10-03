#!/usr/bin/env node
/**
 * One-off helper: finds hospitals with no stored coordinates, looks each one up
 * on OpenStreetMap Nominatim, and writes a reviewable SQL file.
 *
 *   node scripts/geocode-hospitals.mjs [--table kerala_hospitals] [--out supabase/seeds/hospital_coordinates.generated.sql]
 *
 * Reads VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY from .env (the anon key only
 * needs read access). Nothing is written to the database: review the generated
 * SQL (matches are best-effort) and run it yourself in the Supabase SQL editor.
 *
 * Follows the Nominatim usage policy: sequential requests, 1+ second apart, with
 * an identifying User-Agent. Set NOMINATIM_EMAIL (or VITE_NOMINATIM_EMAIL) so the
 * operators can contact you, and NOMINATIM_BASE_URL to use your own instance.
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs';

const args = process.argv.slice(2);
const arg = (name, fallback) => {
  const i = args.indexOf(`--${name}`);
  return i !== -1 && args[i + 1] ? args[i + 1] : fallback;
};

const TABLE = arg('table', 'kerala_hospitals');
const OUT = arg('out', 'supabase/seeds/hospital_coordinates.generated.sql');

if (!/^[a-z_][a-z0-9_]*$/i.test(TABLE)) {
  console.error(`Invalid table name: ${TABLE}`);
  process.exit(1);
}

function loadEnv() {
  const env = { ...process.env };
  if (existsSync('.env')) {
    for (const line of readFileSync('.env', 'utf8').split(/\r?\n/)) {
      const m = /^\s*([A-Z0-9_]+)\s*=\s*"?([^"#]*?)"?\s*$/.exec(line);
      if (m && env[m[1]] === undefined) env[m[1]] = m[2];
    }
  }
  return env;
}

const env = loadEnv();
const SUPABASE_URL = env.VITE_SUPABASE_URL?.replace(/\/+$/, '');
const SUPABASE_KEY = env.VITE_SUPABASE_ANON_KEY;
const NOMINATIM = (env.NOMINATIM_BASE_URL || 'https://nominatim.openstreetmap.org').replace(/\/+$/, '');
const EMAIL = env.NOMINATIM_EMAIL || env.VITE_NOMINATIM_EMAIL || '';

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY must be set (in .env or the environment).');
  process.exit(1);
}
if (!EMAIL) {
  console.warn('Tip: set NOMINATIM_EMAIL so the Nominatim operators can contact you if needed.\n');
}

const KERALA = { west: 74.85, north: 12.8, east: 77.45, south: 8.15 };
const sleep = ms => new Promise(r => setTimeout(r, ms));

async function fetchMissing() {
  const url = `${SUPABASE_URL}/rest/v1/${TABLE}?select=id,name,address,city,district&or=(latitude.is.null,longitude.is.null)&order=name`;
  const res = await fetch(url, { headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` } });
  if (!res.ok) throw new Error(`Supabase responded ${res.status}: ${await res.text()}`);
  return res.json();
}

let last = 0;
async function nominatim(q) {
  const wait = last + 1200 - Date.now();
  if (wait > 0) await sleep(wait);
  last = Date.now();

  const params = new URLSearchParams({
    q, format: 'jsonv2', limit: '1', countrycodes: 'in', 'accept-language': 'en',
    viewbox: `${KERALA.west},${KERALA.north},${KERALA.east},${KERALA.south}`, bounded: '1',
  });
  if (EMAIL) params.set('email', EMAIL);

  const res = await fetch(`${NOMINATIM}/search?${params}`, {
    headers: { 'User-Agent': `MediTrack-hospital-geocoder/1.0 ${EMAIL ? `(${EMAIL})` : ''}`.trim() },
  });
  if (res.status === 429) throw new Error('Rate limited by Nominatim (HTTP 429). Wait a while and run again.');
  if (!res.ok) throw new Error(`Nominatim responded ${res.status}`);

  const hit = (await res.json())[0];
  if (!hit) return null;
  const lat = Number(hit.lat), lon = Number(hit.lon);
  const inKerala = lat >= KERALA.south && lat <= KERALA.north && lon >= KERALA.west && lon <= KERALA.east;
  return inKerala ? { lat, lon, name: hit.display_name, type: hit.addresstype || hit.type } : null;
}

// Most specific first. A bare "city" match is only a town centre, so it is reported as low confidence.
function attempts(h) {
  const place = [h.city, h.district].filter((v, i, a) => v && a.indexOf(v) === i).join(', ');
  return [
    { q: [h.name, h.address, place, 'Kerala'].filter(Boolean).join(', '), confidence: 'high' },
    { q: [h.name, place, 'Kerala'].filter(Boolean).join(', '), confidence: 'medium' },
    { q: [h.address, place, 'Kerala'].filter(Boolean).join(', '), confidence: 'low' },
  ].filter((a, i, all) => a.q && all.findIndex(b => b.q === a.q) === i);
}

const esc = v => String(v).replace(/'/g, "''");

const rows = await fetchMissing();
console.log(`${rows.length} hospital(s) without coordinates in ${TABLE}.\n`);

const sql = [`-- Generated ${new Date().toISOString()} by scripts/geocode-hospitals.mjs`, '-- Review every row before running. Source: OpenStreetMap contributors (ODbL), via Nominatim.', 'BEGIN;'];
const failed = [];

for (const [i, h] of rows.entries()) {
  let found = null;
  for (const attempt of attempts(h)) {
    const hit = await nominatim(attempt.q);
    if (hit) { found = { ...hit, confidence: attempt.confidence, q: attempt.q }; break; }
  }

  if (!found) {
    failed.push(h);
    console.log(`[${i + 1}/${rows.length}] NOT FOUND  ${h.name}`);
    continue;
  }

  console.log(`[${i + 1}/${rows.length}] ${found.confidence.padEnd(6)}  ${h.name}  ->  ${found.lat}, ${found.lon}  (${found.type})`);
  sql.push(
    `-- ${found.confidence} confidence: ${esc(h.name)} | matched "${esc(found.q)}" -> ${esc(found.name)}`,
    `UPDATE ${TABLE} SET latitude = ${found.lat}, longitude = ${found.lon} WHERE id = '${esc(h.id)}';`,
  );
}

sql.push('COMMIT;');
writeFileSync(OUT, sql.join('\n') + '\n');

console.log(`\nWrote ${OUT}`);
if (failed.length) {
  console.log(`\n${failed.length} not found, add these by hand:`);
  failed.forEach(h => console.log(`  - ${h.name} (${h.id})`));
}
