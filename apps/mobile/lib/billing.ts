type WebPackage = {
  product?: {
    priceString?: string;
  };
};

export async function initBilling(_userId: string): Promise<boolean> {
  return false;
}

export async function getPrimaryPackage(_userId: string): Promise<WebPackage | null> {
  return null;
}

export async function purchaseVeilPlus(_userId: string): Promise<boolean> {
  return false;
}

export async function restoreVeilPlus(_userId: string): Promise<boolean> {
  return false;
}
