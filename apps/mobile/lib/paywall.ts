import AsyncStorage from '@react-native-async-storage/async-storage';
import * as WebBrowser from 'expo-web-browser';

export const VEIL_PLUS_URL = 'https://morvencode.gumroad.com/l/veil-plus';

const HAS_SEEN_PAYWALL_KEY = 'has_seen_paywall';
const TRIAL_STARTED_AT_KEY = 'trial_started_at';

export async function markPaywallSeen(): Promise<void> {
  await AsyncStorage.setItem(HAS_SEEN_PAYWALL_KEY, 'true');
}

export async function hasSeenPaywall(): Promise<boolean> {
  return (await AsyncStorage.getItem(HAS_SEEN_PAYWALL_KEY)) === 'true';
}

export async function getTrialStartedAt(): Promise<string | null> {
  return AsyncStorage.getItem(TRIAL_STARTED_AT_KEY);
}

export async function startVeilPlusTrial(): Promise<void> {
  await markPaywallSeen();
  if (!(await AsyncStorage.getItem(TRIAL_STARTED_AT_KEY))) {
    await AsyncStorage.setItem(TRIAL_STARTED_AT_KEY, new Date().toISOString());
  }
  await WebBrowser.openBrowserAsync(VEIL_PLUS_URL);
}
