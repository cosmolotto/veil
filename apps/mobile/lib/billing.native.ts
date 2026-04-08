// Billing is handled via Gumroad web checkout (see paywall.ts).
// This stub keeps the module interface intact for any existing imports.

export async function initBilling(_userId: string): Promise<boolean> {
  return false;
}

export async function getPrimaryPackage(_userId: string): Promise<null> {
  return null;
}

export async function purchaseVeilPlus(_userId: string): Promise<boolean> {
  return false;
}

export async function restoreVeilPlus(_userId: string): Promise<boolean> {
  return false;
}
