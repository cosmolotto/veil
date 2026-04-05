# VEIL Play Console Data Safety Worksheet

Last updated: April 5, 2026

Use this as your source-of-truth while completing Google Play Data Safety.

## 1. Data Collected

Mark as collected (based on current implementation):

1. Personal Info
- Email address (auth)

2. Personal Messages / User Content
- Reflection responses (text/voice/sketch metadata)
- Thread messages
- Soul snapshots

3. App Activity
- In-app interactions tied to features (responses, matching, connection actions)

4. Device or Other IDs
- Push token (Expo push token)

5. Financial Info
- Purchase entitlement/subscription status (via RevenueCat/store)

## 2. Is Data Shared?

Set according to your deployment architecture:
- Shared with processors/service providers: Yes (Supabase, OpenAI, RevenueCat, Expo/FCM/APNs)
- Sold to data brokers/advertisers: No

## 3. Purpose of Collection

Typical purposes to select:
- App functionality
- Analytics/performance (only if enabled)
- Account management
- Security/fraud prevention
- Developer communications (if applicable)

## 4. Security Practices

Declare only if true in production:
- Data encrypted in transit: Yes
- User content encrypted in storage within app infrastructure: Yes
- Account deletion request support: Yes

## 5. Data Deletion

If you support deletion requests by support channel/API workflow, mark deletion supported and ensure policy + operations match. VEIL now supports in-app account deletion and support-channel requests.

## 6. Required Consistency Checks

Before submitting Data Safety:
1. Privacy Policy URL in Play listing matches current behavior.
2. In-app subscription text matches Play policy requirements.
3. Any analytics SDKs not currently used are not declared as active collection.
4. If you add crash/analytics SDKs later, update Data Safety immediately.

## 7. Current Third Parties to Disclose

- Supabase
- OpenAI
- RevenueCat
- Expo/FCM/APNs
- Google Play Billing / Apple App Store billing flows

## 8. Final Review Notes

- Ensure claims about encryption-at-rest are accurate.
- Ensure support email is reachable and monitored.
- Keep screenshots of completed forms and policy versions for audit history.
