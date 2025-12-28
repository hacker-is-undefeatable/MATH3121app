import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import MainLayout from './components/MainLayout';
import { AuthProvider } from './contexts/AuthContext';

// Import screens
import DashboardScreen from './screens/DashboardScreen';
import HistoryScreen from './screens/HistoryScreen';
import HomeScreen from './screens/HomeScreen';
import LoginScreen from './screens/LoginScreen';
import ProfileScreen from './screens/ProfileScreen';
import QuizScreen from './screens/QuizScreen';
import RegisterScreen from './screens/RegisterScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <AuthProvider>
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName="Login"
          screenOptions={{
            headerShown: false,
          }}
        >
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
          <Stack.Screen name="Dashboard" component={DashboardScreen} />
          
          {/* Screens with Bottom Navigation */}
          <Stack.Screen name="Home">
            {() => (
              <MainLayout>
                <HomeScreen />
              </MainLayout>
            )}
          </Stack.Screen>
          
          <Stack.Screen name="History">
            {() => (
              <MainLayout>
                <HistoryScreen />
              </MainLayout>
            )}
          </Stack.Screen>
          
          <Stack.Screen name="Profile">
            {() => (
              <MainLayout>
                <ProfileScreen />
              </MainLayout>
            )}
          </Stack.Screen>
          
          {/* Quiz screen without bottom nav */}
          <Stack.Screen name="Quiz" component={QuizScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </AuthProvider>
  );
}