#!/usr/bin/env node
/**
 * update-play-listing.mjs
 *
 * Fills in the VEIL Play Store listing and privacy policy URL
 * using the Google Play Developer API.
 *
 * Prerequisites:
 *   - play-service-account.json at repo root
 *   - Run: pnpm add googleapis (or: npm install googleapis)
 *
 * Usage:
 *   node scripts/update-play-listing.mjs
 */

import { google } from 'googleapis';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');

const PACKAGE_NAME = 'com.morvenempire.veil';
const KEY_FILE = resolve(ROOT, 'play-service-account.json');
const LANGUAGE = 'en-US';

const LISTING = {
  title: "VEIL \u2014 Be Known Before You're Seen",
  shortDescription:
    'Anonymous reflection app. Real connection before identity is revealed.',
  fullDescription: `What if you could meet someone who truly understands you \u2014 before they ever saw your face?

VEIL is a private reflection network built for people who want something deeper than photos, likes, and personal branding.

Every day, you receive one question. Not "what do you look like?" or "what do you do?" \u2014 but something harder. Something real. You answer honestly, and VEIL builds a Soul Map from your responses. Quietly, in the background, it surfaces people who emotionally resonate with how you think and feel.

No photos until you\u2019re ready.
No profiles built for performance.
No algorithms rewarding the loudest voice.

HOW IT WORKS:
\u2022 Each day you get one reflection prompt \u2014 grief, wonder, desire, fear, joy, identity
\u2022 Answer in your own words. Your response shapes your Soul Map.
\u2022 VEIL finds resonance matches: people who mirror, contrast, or echo your emotional signature
\u2022 You connect anonymously. The conversation begins before any name or face is shared.
\u2022 If the connection deepens enough, you can choose to unveil \u2014 or keep it anonymous forever.

VEIL IS FOR PEOPLE WHO:
\u2022 Are tired of shallow social feeds
\u2022 Want to be known for how they think, not how they look
\u2022 Are navigating grief, becoming, loneliness, or transformation
\u2022 Miss the feeling of truly being understood
\u2022 Believe the best conversations begin somewhere unexpected

PRIVACY BY DESIGN:
\u2022 Your responses are encrypted
\u2022 Your identity stays hidden until you choose to unveil
\u2022 You can export all your data anytime
\u2022 You can delete your account completely, no questions asked
\u2022 No third-party ad tracking

VEIL+ (optional premium, $4.99/month):
\u2022 Reveals your waiting resonance matches
\u2022 Unlocks deeper thread access
\u2022 7-day free trial, cancel anytime

CONTENT NOTE:
VEIL deals with mature emotional themes including grief, longing, identity, fear, vulnerability, and intimacy. This is not a place for performance. It is quiet, intentional, and designed for emotional depth. Recommended for ages 17+.

No ads. No follower counts. No noise.

One question. One answer. One soul at a time.`,
};

const PRIVACY_POLICY_URL =
  'https://cosmolotto.github.io/veil/legal/privacy-policy';

async function main() {
  // Verify key file exists
  try {
    readFileSync(KEY_FILE);
  } catch {
    console.error(`\nError: Service account key not found at:\n  ${KEY_FILE}\n`);
    console.error(
      'Follow the setup instructions in scripts/submit-to-play.sh first.\n'
    );
    process.exit(1);
  }

  const auth = new google.auth.GoogleAuth({
    keyFile: KEY_FILE,
    scopes: ['https://www.googleapis.com/auth/androidpublisher'],
  });

  const androidpublisher = google.androidpublisher({ version: 'v3', auth });

  console.log('Creating edit...');
  const editRes = await androidpublisher.edits.insert({
    packageName: PACKAGE_NAME,
  });
  const editId = editRes.data.id;
  console.log(`  Edit ID: ${editId}`);

  console.log('Updating store listing...');
  await androidpublisher.edits.listings.update({
    packageName: PACKAGE_NAME,
    editId,
    language: LANGUAGE,
    requestBody: {
      language: LANGUAGE,
      title: LISTING.title,
      shortDescription: LISTING.shortDescription,
      fullDescription: LISTING.fullDescription,
    },
  });
  console.log('  Store listing updated.');

  console.log('Setting privacy policy URL...');
  await androidpublisher.edits.details.update({
    packageName: PACKAGE_NAME,
    editId,
    requestBody: {
      defaultLanguage: LANGUAGE,
      contactWebsite: 'https://cosmolotto.github.io/veil',
      contactEmail: 'support@veil.app',
    },
  });
  // Privacy policy is set at the app level, not per-edit — use the appDetails endpoint
  await androidpublisher.edits.details.update({
    packageName: PACKAGE_NAME,
    editId,
    requestBody: {
      defaultLanguage: LANGUAGE,
    },
  });
  console.log('  Details updated.');

  console.log('Committing edit...');
  await androidpublisher.edits.commit({
    packageName: PACKAGE_NAME,
    editId,
  });
  console.log('\nDone. Store listing is live in Play Console.');
  console.log(
    '\nNote: Set the privacy policy URL manually in Play Console:'
  );
  console.log(`  Policy -> App content -> Privacy policy -> ${PRIVACY_POLICY_URL}`);
}

main().catch((err) => {
  console.error('\nFailed:', err.message ?? err);
  process.exit(1);
});
