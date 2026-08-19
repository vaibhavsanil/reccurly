import { Stack } from "expo-router";

import '@/global.css';

export default function RootLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="onboarding" />
      <Stack.Screen name="subscriptions/[id]" />
    </Stack>
  );
}
