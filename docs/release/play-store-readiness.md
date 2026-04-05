# VEIL Play Store Readiness

Last updated: April 5, 2026

## Ready in repo

- Android package configured as `com.morvenempire.veil`
- EAS preview APK profile configured
- EAS production Android App Bundle profile configured
- Privacy policy and Play data safety notes documented
- In-app account export and deletion flow implemented
- Stored reflection/thread content encrypted at the app layer

## Required secrets before real submission

- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `OPENAI_API_KEY`
- `RESPONSE_ENCRYPTION_KEY`
- `REVENUECAT_WEBHOOK_SECRET`
- `EXPO_PUBLIC_SUPABASE_URL`
- `EXPO_PUBLIC_SUPABASE_ANON_KEY`
- `EXPO_PUBLIC_API_URL`
- `EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY`
- `EXPO_PUBLIC_REVENUECAT_ENTITLEMENT_ID`

## Release commands

First validate env + Expo config:

```bash
pnpm release:check
```

Internal Android test build:

```bash
pnpm build:android:preview
```

Production Android App Bundle:

```bash
pnpm build:android:production
```

Submit to Google Play:

```bash
pnpm submit:android:production
```

## Play Console checklist

1. Upload the privacy policy URL from `docs/legal/privacy-policy.md`.
2. Complete Data Safety using `docs/legal/play-data-safety.md`.
3. Confirm subscription screenshots and VEIL+ copy match in-app behavior.
4. Verify support email is monitored.
5. Test magic link auth, prompt response submission, thread messaging, plus purchase restore, export, and deletion on a closed-track build.

## Notes

- `submit.production` is set to Google Play `internal` track with `draft` release status so the first automated submit is safer.
- Increase `expo.version`, `android.versionCode`, and `ios.buildNumber` in `apps/mobile/app.json` for each store release.
