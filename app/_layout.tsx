import { Stack } from 'expo-router';
import { SessionProvider, useSession } from './ctx';
import { SplashScreenController } from './splash';

export default function Root() {
  return (
    <SessionProvider>
      <SplashScreenController />
      <RootNavigator />
    </SessionProvider>
  );
}

function RootNavigator() {
  const { session } = useSession();

  return (
    <Stack screenOptions={{ headerStyle: { backgroundColor: '#1a1a1a' }, headerTintColor: '#fff' }}>
      <Stack.Protected guard={!session}>
        <Stack.Screen name="index" options={{ headerShown: false }} />
      </Stack.Protected>

      <Stack.Protected guard={!!session}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="Quiz" options={{ title: 'Quiz' }} />
        <Stack.Screen name="ResultsScreen" options={{ title: 'Results' }} />
      </Stack.Protected>
    </Stack>
  );
}