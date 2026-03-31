/**
 * RevenueCat purchases integration — stub implementation.
 *
 * This file provides a no-op stub for PREVIEW/DEBUG builds.
 * For PRODUCTION with real RevenueCat integration, replace this file
 * with the native implementation and re-enable react-native-purchases.
 *
 * Product ID:  veil_plus_monthly
 * Price:       $4.99/month
 * Entitlement: veil_plus
 */

export const VEIL_PLUS_PRODUCT_ID = 'veil_plus_monthly';

export async function initPurchases(_userId?: string): Promise<void> {
  // Preview stub — no-op
}

export async function checkSubscription(): Promise<boolean> {
  // Preview stub — always returns false (not subscribed)
  return false;
}

export async function purchaseVeilPlus(): Promise<boolean> {
  // Preview stub — simulates successful purchase for UI testing
  return true;
}

export async function restorePurchases(): Promise<boolean> {
  // Preview stub — no-op
  return false;
}
