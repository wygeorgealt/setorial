import { Tabs } from 'expo-router';
import { Home, Search, Wallet, MoreHorizontal, ShoppingBag } from 'lucide-react-native';
import { useColorScheme } from 'nativewind';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuthStore } from '../../store/authStore';
import { getTierColors } from '../../utils/theme';

export default function TabLayout() {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { user } = useAuthStore();
  const insets = useSafeAreaInsets();

  const theme = getTierColors(user?.tier);
  const activeColor = isDark ? theme.border : theme.primary;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          position: 'absolute',
          bottom: Math.max(20, insets.bottom + 10),
          left: 24,
          right: 24,
          backgroundColor: isDark ? '#1E222B' : '#FFFFFF',
          borderTopWidth: 0,
          height: 65,
          borderRadius: 30,
          paddingHorizontal: 10,
          paddingBottom: 0,
          paddingTop: 0,
          elevation: 15,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 5 },
          shadowOpacity: 0.1,
          shadowRadius: 15,
          borderWidth: 2,
          borderColor: isDark ? '#272B36' : '#E5E5E5',
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
              paddingHorizontal: 14,
              paddingVertical: 8,
              borderRadius: 20,
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <Home size={22} color={color} strokeWidth={focused ? 2.5 : 2} />
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
              paddingHorizontal: 14,
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
              paddingHorizontal: 14,
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
              paddingHorizontal: 14,
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
              paddingHorizontal: 14,
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
