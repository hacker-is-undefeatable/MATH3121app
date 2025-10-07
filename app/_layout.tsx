import { createStackNavigator } from '@react-navigation/stack';
import React from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import DashboardScreen from './screens/DashboardScreen';
import LoginScreen from './screens/LoginScreen';
import QuizScreen from './screens/QuizScreen';
import RegisterScreen from './screens/RegisterScreen';

const Stack = createStackNavigator();

function AppNavigator() {
  const { user } = useAuth();

  return (
    <Stack.Navigator initialRouteName="Login" screenOptions={{ headerShown: false }}>
      {!user ? (
        <>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
        </>
      ) : (
        <>
          <Stack.Screen name="Dashboard" component={DashboardScreen} />
          <Stack.Screen name="Quiz" component={QuizScreen} />
        </>
      )}
    </Stack.Navigator>
  );
}

export default function App() {
  return (
    <AuthProvider>
        <AppNavigator />
    </AuthProvider>
  );
}