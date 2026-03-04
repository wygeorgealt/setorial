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
          backgroundColor: isDark ? '#13151A' : '#FFFFFF',
          borderTopWidth: 2,
          borderTopColor: isDark ? '#272B36' : '#E5E5E5', // Thicker gray/slate border
          height: 85,
          paddingBottom: 30,
          paddingTop: 10,
          elevation: 0,
          shadowOpacity: 0,
        },
        tabBarActiveTintColor: '#1CB0F6', // Duolingo Blue for active
        tabBarInactiveTintColor: '#AFAFAF',
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: 'bold',
          marginTop: 4,
          textTransform: 'uppercase',
          letterSpacing: 0.5,
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
