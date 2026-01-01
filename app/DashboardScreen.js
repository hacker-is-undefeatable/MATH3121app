import { useNavigation } from '@react-navigation/native';
import { useEffect } from 'react';
import { useAuth } from './contexts/AuthContext';

export default function DashboardScreen() {
  const navigation = useNavigation();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      // Redirect to Home screen after login
      navigation.replace('(tabs)');
    } else {
      // If not authenticated, go to login
      navigation.replace('login');
    }
  }, [user, navigation]);

  return null; // This screen doesn't render anything
}