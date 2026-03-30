/**
 * RevenueCat purchases integration.
 *
 * For PREVIEW/DEBUG builds: uses a no-op stub so EAS build doesn't require
 * the full native react-native-purchases SDK to be linked.
 *
 * For PRODUCTION: set EXPO_PUBLIC_REVENUECAT_ENABLED=true and ensure
 * react-native-purchases is installed + configured with expo-build-properties.
 *
 * Product ID:  veil_plus_monthly
 * Price:       $4.99/month
 * Entitlement: veil_plus
 */

const RC_ENABLED = process.env.EXPO_PUBLIC_REVENUECAT_ENABLED === 'true';
const RC_KEY_IOS = process.env.EXPO_PUBLIC_REVENUECAT_API_KEY ?? '';
const RC_KEY_ANDROID = process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY ?? '';

export const VEIL_PLUS_PRODUCT_ID = 'veil_plus_monthly';

// ── Lazy-load the real SDK only when enabled ──────────────────────────────
let _Purchases: typeof import('react-native-purchases').default | null = null;

async function getSdk() {
  if (!RC_ENABLED) return null;
  if (_Purchases) return _Purchases;
  try {
    const mod = await import('react-native-purchases');
    _Purchases = mod.default;
    return _Purchases;
  } catch {
    return null;
  }
}

export async function initPurchases(userId?: string): Promise<void> {
  const Purchases = await getSdk();
  if (!Purchases) return;
  const { Platform } = await import('react-native');
  const key = Platform.OS === 'ios' ? RC_KEY_IOS : RC_KEY_ANDROID;
  if (!key) return;
  // v8 API: setDebugLogsEnabled instead of setLogLevel
  Purchases.setDebugLogsEnabled(false);
  Purchases.configure({ apiKey: key });
  if (userId) Purchases.logIn(userId);
}

export async function checkSubscription(): Promise<boolean> {
  const Purchases = await getSdk();
  if (!Purchases) return false;
  try {
    const info = await Purchases.getCustomerInfo();
    return info.entitlements.active['veil_plus'] !== undefined;
  } catch {
    return false;
  }
}

export async function purchaseVeilPlus(): Promise<boolean> {
  const Purchases = await getSdk();
  if (!Purchases) {
    // Preview stub — simulate successful purchase for UI testing
    return true;
  }
  const offerings = await Purchases.getOfferings();
  const pkg =
    offerings.current?.availablePackages.find(
      (p) => p.product.identifier === VEIL_PLUS_PRODUCT_ID
    ) ?? offerings.current?.availablePackages[0];
  if (!pkg) throw new Error('VEIL+ package not found. Check RevenueCat dashboard.');
  const { customerInfo } = await Purchases.purchasePackage(pkg);
  return customerInfo.entitlements.active['veil_plus'] !== undefined;
}

export async function restorePurchases(): Promise<boolean> {
  const Purchases = await getSdk();
  if (!Purchases) return false;
  const info = await Purchases.restorePurchases();
  return info.entitlements.active['veil_plus'] !== undefined;
}
