import { SplashScreen } from 'expo-router';
import { useEffect } from 'react';
import { useSession } from './ctx';

export function SplashScreenController() {
  const { isLoading } = useSession();

  useEffect(() => {
    SplashScreen.preventAutoHideAsync();
  }, []);

  useEffect(() => {
    if (!isLoading) {
      SplashScreen.hideAsync();
    }
  }, [isLoading]);

  return null;
}