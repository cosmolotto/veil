import { Tabs } from 'expo-router';
import { Text } from 'react-native';
import { COLORS } from '../../lib/constants';

function TabIcon({ symbol, color }: { symbol: string; color: string }) {
  return <Text style={{ color, fontSize: 18 }}>{symbol}</Text>;
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarStyle: {
          backgroundColor: COLORS.dark,
          borderTopColor: COLORS.border,
          borderTopWidth: 1,
          height: 60,
        },
        tabBarActiveTintColor: COLORS.accent,
        tabBarInactiveTintColor: COLORS.muted,
        tabBarLabelStyle: { fontSize: 11, fontWeight: '500', marginBottom: 6 },
        headerShown: false,
      }}
    >
      <Tabs.Screen name="today" options={{ title: 'Today', tabBarIcon: ({ color }) => <TabIcon symbol="○" color={color} /> }} />
      <Tabs.Screen name="veil" options={{ title: 'Veil', tabBarIcon: ({ color }) => <TabIcon symbol="◌" color={color} /> }} />
      <Tabs.Screen name="thread" options={{ title: 'Thread', tabBarIcon: ({ color }) => <TabIcon symbol="◍" color={color} /> }} />
      <Tabs.Screen name="self" options={{ title: 'Self', tabBarIcon: ({ color }) => <TabIcon symbol="◎" color={color} /> }} />
      <Tabs.Screen name="plus" options={{ href: null }} />
    </Tabs>
  );
}
