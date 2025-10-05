import { Stack } from 'expo-router';
import { AuthProvider, useAuth } from './contexts/AuthContext';

export default function Layout() {
  const { user } = useAuth();
  return (
    <AuthProvider>
      <Stack initialRouteName="login">
        {!user ? (
          <>
            <Stack.Screen name="login" options={{ headerShown: false }} />
            <Stack.Screen name="register" options={{ headerShown: false }} />
          </>
        ) : (
          <>
            <Stack.Screen name="dashboard" options={{ headerShown: false }} />
            <Stack.Screen name="quiz" options={{ headerShown: false }} />
          </>
        )}
      </Stack>
    </AuthProvider>
  );
}