/**
 * Disable auto-linking of react-native-purchases for preview/debug builds.
 * The lib/purchases.ts module lazy-loads it at runtime only when
 * EXPO_PUBLIC_REVENUECAT_ENABLED=true (production builds).
 *
 * To re-enable for production native builds, remove the null platform entries.
 */
module.exports = {
  dependencies: {
    'react-native-purchases': {
      platforms: {
        android: null,
        ios: null,
      },
    },
  },
};
