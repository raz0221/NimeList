import { Stack } from 'expo-router';

export default function ExploreLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="genres" />
      <Stack.Screen name="leaderboard" />
      <Stack.Screen name="seasonal" />
      <Stack.Screen name="upcoming" />
      <Stack.Screen name="[id]" />
    </Stack>
  );
}
