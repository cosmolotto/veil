import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';

const DAY2_PERMISSION_KEY = 'veil_day2_permission_prompted';
const CONNECTION_ALERT_KEY = 'veil_connection_notification_sent';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: false,
    shouldSetBadge: false,
    shouldShowAlert: true,
  }),
});

export async function ensureDayTwoNotifications(accountCreatedAt?: string | null): Promise<void> {
  if (!accountCreatedAt) return;
  const ageMs = Date.now() - new Date(accountCreatedAt).getTime();
  if (ageMs < 24 * 60 * 60 * 1000) return;
  if (await AsyncStorage.getItem(DAY2_PERMISSION_KEY)) return;

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  await AsyncStorage.setItem(DAY2_PERMISSION_KEY, new Date().toISOString());
  if (finalStatus !== 'granted') return;

  await Notifications.cancelAllScheduledNotificationsAsync();
  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'VEIL',
      body: 'Your daily question is waiting',
    },
    trigger: {
      hour: 9,
      minute: 0,
      repeats: true,
    },
  });
}

export async function maybeNotifyResonanceSuggestions(count: number): Promise<void> {
  if (count < 1) return;
  const today = new Date().toISOString().slice(0, 10);
  if ((await AsyncStorage.getItem(CONNECTION_ALERT_KEY)) === today) return;

  const { status } = await Notifications.getPermissionsAsync();
  if (status !== 'granted') return;

  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'VEIL',
      body: 'Someone resonates with you',
    },
    trigger: null,
  });

  await AsyncStorage.setItem(CONNECTION_ALERT_KEY, today);
}
