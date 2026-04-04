import Purchases, { CustomerInfo, LOG_LEVEL, PurchasesPackage } from 'react-native-purchases';
import { Platform } from 'react-native';

const ENTITLEMENT_ID = process.env.EXPO_PUBLIC_REVENUECAT_ENTITLEMENT_ID || 'veil_plus';

let initializedForUser: string | null = null;

function getRevenueCatApiKey(): string | null {
  if (Platform.OS === 'ios') {
    return process.env.EXPO_PUBLIC_REVENUECAT_IOS_API_KEY
      || process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY
      || null;
  }
  return process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY
    || process.env.EXPO_PUBLIC_REVENUECAT_IOS_API_KEY
    || null;
}

function hasPlusEntitlement(customerInfo: CustomerInfo): boolean {
  return Boolean(customerInfo.entitlements.active?.[ENTITLEMENT_ID]);
}

export async function initBilling(userId: string): Promise<boolean> {
  const apiKey = getRevenueCatApiKey();
  if (!apiKey) return false;

  if (initializedForUser === userId) return true;

  Purchases.setLogLevel(LOG_LEVEL.ERROR);
  await Purchases.configure({ apiKey, appUserID: userId });
  initializedForUser = userId;
  return true;
}

export async function getPrimaryPackage(userId: string): Promise<PurchasesPackage | null> {
  const ready = await initBilling(userId);
  if (!ready) return null;
  const offerings = await Purchases.getOfferings();
  const available = offerings.current?.availablePackages || [];
  return available.find((p) => p.identifier.includes('monthly')) || available[0] || null;
}

export async function purchaseVeilPlus(userId: string): Promise<boolean> {
  const selectedPackage = await getPrimaryPackage(userId);
  if (!selectedPackage) return false;
  const result = await Purchases.purchasePackage(selectedPackage);
  return hasPlusEntitlement(result.customerInfo);
}

export async function restoreVeilPlus(userId: string): Promise<boolean> {
  const ready = await initBilling(userId);
  if (!ready) return false;
  const customerInfo = await Purchases.restorePurchases();
  return hasPlusEntitlement(customerInfo);
}
