import Purchases, { LOG_LEVEL, PurchasesPackage } from 'react-native-purchases';
import { Platform } from 'react-native';
import { VEIL_PLUS_PRODUCT_ID } from './constants';

const RC_API_KEY = Platform.OS === 'ios'
  ? (process.env.EXPO_PUBLIC_REVENUECAT_API_KEY ?? '')
  : (process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY ?? '');

let _initialized = false;

export function initPurchases(userId?: string): void {
  if (_initialized) return;
  Purchases.setLogLevel(LOG_LEVEL.WARN);
  Purchases.configure({ apiKey: RC_API_KEY });
  if (userId) Purchases.logIn(userId);
  _initialized = true;
}

export async function checkSubscription(): Promise<boolean> {
  try {
    const info = await Purchases.getCustomerInfo();
    return info.entitlements.active['veil_plus'] !== undefined;
  } catch {
    return false;
  }
}

export async function getVeilPlusPackage(): Promise<PurchasesPackage | null> {
  try {
    const offerings = await Purchases.getOfferings();
    const pkg = offerings.current?.availablePackages.find(
      (p) => p.product.identifier === VEIL_PLUS_PRODUCT_ID
    ) ?? offerings.current?.availablePackages[0] ?? null;
    return pkg;
  } catch {
    return null;
  }
}

export async function purchaseVeilPlus(): Promise<boolean> {
  const pkg = await getVeilPlusPackage();
  if (!pkg) throw new Error('VEIL+ package not found. Check RevenueCat dashboard.');
  const { customerInfo } = await Purchases.purchasePackage(pkg);
  return customerInfo.entitlements.active['veil_plus'] !== undefined;
}

export async function restorePurchases(): Promise<boolean> {
  const info = await Purchases.restorePurchases();
  return info.entitlements.active['veil_plus'] !== undefined;
}
