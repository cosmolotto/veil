import fs from 'node:fs';
import path from 'node:path';

function loadDotEnv(filename) {
  const filePath = path.resolve(process.cwd(), filename);
  if (!fs.existsSync(filePath)) return;

  const contents = fs.readFileSync(filePath, 'utf8');
  for (const rawLine of contents.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;
    const eqIndex = line.indexOf('=');
    if (eqIndex === -1) continue;

    const key = line.slice(0, eqIndex).trim();
    const value = line.slice(eqIndex + 1).trim().replace(/^['"]|['"]$/g, '');

    if (!(key in process.env)) {
      process.env[key] = value;
    }
  }
}

loadDotEnv('.env');
loadDotEnv('.env.local');

const required = [
  'EXPO_PUBLIC_SUPABASE_URL',
  'EXPO_PUBLIC_SUPABASE_ANON_KEY',
  'EXPO_PUBLIC_API_URL',
  'EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY',
  'EXPO_PUBLIC_REVENUECAT_ENTITLEMENT_ID',
];

const optional = [
  'EXPO_PUBLIC_REVENUECAT_IOS_API_KEY',
];

let hasError = false;

for (const key of required) {
  if (!process.env[key]) {
    hasError = true;
    console.error(`Missing required env: ${key}`);
  }
}

for (const key of optional) {
  if (!process.env[key]) {
    console.warn(`Optional env not set: ${key}`);
  }
}

if (hasError) {
  process.exit(1);
}

console.log('Release env check passed.');
