import { Tabs } from 'expo-router';
import { Home, Search, Layers, MoreHorizontal, LayoutGrid } from 'lucide-react-native';
import { useColorScheme } from 'nativewind';
import { View } from 'react-native';

export default function TabLayout() {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopWidth: 1,
          borderTopColor: '#F3F4F6', // light gray border
          height: 85,
          paddingBottom: 30,
          paddingTop: 10,
        },
        tabBarActiveTintColor: '#000000',
        tabBarInactiveTintColor: '#9CA3AF', // Gray-400
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '500',
          marginTop: 4,
        }
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Learn',
          tabBarIcon: ({ color }) => <LayoutGrid size={24} color={color} strokeWidth={2} />,
        }}
      />
      <Tabs.Screen
        name="courses"
        options={{
          title: 'Discover',
          tabBarIcon: ({ color }) => <Search size={24} color={color} strokeWidth={2} />,
        }}
      />
      <Tabs.Screen
        name="statistics"
        options={{
          title: 'Accumulate',
          tabBarIcon: ({ color }) => <Layers size={24} color={color} strokeWidth={2} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Manage',
          tabBarIcon: ({ color }) => <MoreHorizontal size={24} color={color} strokeWidth={2} />,
        }}
      />
    </Tabs>
  );
}
