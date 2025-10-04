import { Tabs } from 'expo-router';
import { Pressable, Text } from 'react-native';

export default function TabLayout() {
  return (
    <Tabs screenOptions={{ headerShown: false, tabBarStyle: { backgroundColor: '#1a1a1a' }, tabBarActiveTintColor: '#007AFF', tabBarInactiveTintColor: '#fff' }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Select a Quiz',
          tabBarLabel: 'Quizzes',
          headerRight: ({ navigation }) => (
            <Pressable onPress={() => navigation.navigate('ProfileScreen')}>
              <Text style={{ color: '#007AFF', fontSize: 16, fontWeight: '600', marginRight: 15 }}>Profile</Text>
            </Pressable>
          ),
        }}
      />
      <Tabs.Screen
        name="ProfileScreen"
        options={{ title: 'Profile', tabBarLabel: 'Profile' }}
      />
    </Tabs>
  );
}