import { useNavigation } from '@react-navigation/native';
import { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { useAuth } from './contexts/AuthContext';

export default function DashboardScreen() {
  const navigation = useNavigation();
  const { user, loading } = useAuth();
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (!loading) {
      if (user) {
        // User is logged in, go to Home tab
        navigation.replace('(tabs)');
      } else {
        // User is not logged in, go to Login
        navigation.replace('login');
      }
      setInitialized(true);
    }
  }, [user, loading, navigation]);

  // Show loading indicator while checking auth state
  if (!initialized || loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#1f1f1fff' }}>
        <ActivityIndicator size="large" color="#2E8B57" />
      </View>
    );
  }

  return null;
}