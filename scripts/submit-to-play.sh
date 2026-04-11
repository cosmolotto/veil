#!/usr/bin/env bash
# submit-to-play.sh
#
# Submits VEIL to Google Play internal track and fills the store listing.
#
# ─── PREREQUISITE (do this once) ────────────────────────────────────────────
#
#  1. Go to: https://play.google.com/console → Setup → API access
#  2. Link to a Google Cloud project (or create one)
#  3. Click "Create new service account" → follow link to Google Cloud Console
#  4. In Google Cloud:
#       a. Create service account (any name, e.g. "play-publisher")
#       b. Grant it role: "Service Account User" (or leave blank — role is set in Play Console)
#       c. Keys tab → Add Key → JSON → download the file
#  5. Back in Play Console → Service accounts list → Grant access to this account
#       Permissions: Release manager (allows uploading builds + editing listing)
#  6. Save the downloaded JSON key to THIS exact path:
#
#       /Users/alijawad/Downloads/veil/veil/play-service-account.json
#
# ─────────────────────────────────────────────────────────────────────────────

set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
KEY_FILE="$ROOT/play-service-account.json"

# Check service account key exists
if [ ! -f "$KEY_FILE" ]; then
  echo ""
  echo "ERROR: Service account key not found."
  echo "  Expected: $KEY_FILE"
  echo ""
  echo "Follow the prerequisite steps at the top of this script first."
  exit 1
fi

echo "=== VEIL Play Store Submission ==="
echo ""

# Step 1: Submit AAB from EAS build to internal track
echo "[1/2] Submitting AAB to Play Store internal track..."
cd "$ROOT/apps/mobile"
eas submit \
  --platform android \
  --profile production \
  --id 19ddf2f1-808a-4b8b-a6aa-15f490daa42d \
  --non-interactive

echo ""
echo "[2/2] Updating Play Store listing..."

# Install googleapis if needed
cd "$ROOT"
if ! node -e "require('googleapis')" 2>/dev/null; then
  echo "  Installing googleapis..."
  pnpm add -w googleapis
fi

node scripts/update-play-listing.mjs

echo ""
echo "=== Submission complete ==="
echo ""
echo "Next manual steps:"
echo "  1. Play Console → Policy → App content → Content rating"
echo "     Complete questionnaire → select 17+ (mature themes)"
echo ""
echo "  2. Play Console → Store presence → Main store listing"
echo "     Upload screenshots (min 2) and feature graphic (1024x500)"
echo ""
echo "  3. Play Console → Policy → App content → Privacy policy"
echo "     Set URL: https://cosmolotto.github.io/veil/legal/privacy-policy"
echo ""
echo "  4. Once internal testing passes → promote to production"
