import { Tabs } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#1a1a1aff',
          borderTopColor: '#4A5859',
          borderTopWidth: 1,
          height: 60 + Math.max(insets.bottom, 0),
          paddingBottom: Math.max(insets.bottom, 8),
          paddingTop: 8,
          elevation: 8,
        },
        tabBarActiveTintColor: '#2E8B57',
        tabBarInactiveTintColor: '#E0E0E0',
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => (
            <Icon name="home" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: 'History',
          tabBarIcon: ({ color, size }) => (
            <Icon name="history" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="exam"
        options={{
          title: 'Exam',
          tabBarIcon: ({ color, size }) => (
            <Icon name="assignment" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => (
            <Icon name="person" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
