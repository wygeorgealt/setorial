import { Tabs } from 'expo-router';
import { LayoutGrid, Search, Wallet, MoreHorizontal, ShoppingBag } from 'lucide-react-native';
import { useColorScheme } from 'nativewind';
import { View } from 'react-native';
import { useAuthStore } from '../../store/authStore';

export default function TabLayout() {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { user } = useAuthStore();

  const getTierColor = () => {
    switch (user?.tier) {
      case 'BRONZE': return '#CD7F32';
      case 'SILVER': return '#B4B4B4';
      case 'GOLD': return '#FFD700';
      default: return '#58CC02'; // FREE / Blue fallback replaced by Duolingo Green
    }
  };

  const activeColor = getTierColor();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: isDark ? '#13151A' : '#FFFFFF',
          borderTopWidth: 0,
          height: 85,
          paddingHorizontal: 12,
          paddingBottom: 25,
          paddingTop: 12,
          elevation: 10,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.05,
          shadowRadius: 10,
        },
        tabBarActiveTintColor: activeColor,
        tabBarInactiveTintColor: '#AFAFAF',
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '700',
          marginTop: 2,
        }
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, focused }) => (
            <View style={{
              backgroundColor: focused ? (isDark ? '#272B36' : '#F3F4F6') : 'transparent',
              paddingHorizontal: 20,
              paddingVertical: 8,
              borderRadius: 20,
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <LayoutGrid size={22} color={color} strokeWidth={focused ? 2.5 : 2} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="courses"
        options={{
          title: 'Discover',
          tabBarIcon: ({ color, focused }) => (
            <View style={{
              backgroundColor: focused ? (isDark ? '#272B36' : '#F3F4F6') : 'transparent',
              paddingHorizontal: 20,
              paddingVertical: 8,
              borderRadius: 20,
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <Search size={22} color={color} strokeWidth={focused ? 2.5 : 2} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="statistics"
        options={{
          title: 'Wallet',
          tabBarIcon: ({ color, focused }) => (
            <View style={{
              backgroundColor: focused ? (isDark ? '#272B36' : '#F3F4F6') : 'transparent',
              paddingHorizontal: 20,
              paddingVertical: 8,
              borderRadius: 20,
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <Wallet size={22} color={color} strokeWidth={focused ? 2.5 : 2} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="store"
        options={{
          title: 'Store',
          tabBarIcon: ({ color, focused }) => (
            <View style={{
              backgroundColor: focused ? (isDark ? '#272B36' : '#F3F4F6') : 'transparent',
              paddingHorizontal: 20,
              paddingVertical: 8,
              borderRadius: 20,
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <ShoppingBag size={22} color={color} strokeWidth={focused ? 2.5 : 2} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, focused }) => (
            <View style={{
              backgroundColor: focused ? (isDark ? '#272B36' : '#F3F4F6') : 'transparent',
              paddingHorizontal: 20,
              paddingVertical: 8,
              borderRadius: 20,
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <MoreHorizontal size={22} color={color} strokeWidth={focused ? 2.5 : 2} />
            </View>
          ),
        }}
      />
    </Tabs>
  );
}
