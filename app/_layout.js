import { Stack } from 'expo-router';
import { AuthProvider } from './contexts/AuthContext';

export default function RootLayout() {
  return (
    <AuthProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />       {/* Dashboard redirect */}
        <Stack.Screen name="login" />
        <Stack.Screen name="register" />
        <Stack.Screen 
          name="(tabs)" 
          options={{
            headerShown: false,
          }}
        />      {/* Tab screens */}
        <Stack.Screen 
          name="quiz" 
          options={{
            headerShown: false,
          }}
        />
      </Stack>
    </AuthProvider>
  );
}
