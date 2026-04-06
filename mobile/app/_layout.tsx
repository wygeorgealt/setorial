import "../global.css";
import { Stack, useRouter, useSegments } from "expo-router";
import { useEffect, useState } from "react";
import { useAuthStore } from "../store/authStore";
import * as SecureStore from 'expo-secure-store';
import * as SplashScreen from 'expo-splash-screen';
import AnimatedSplash from "../components/AnimatedSplash";
import { registerForPushNotificationsAsync } from "../services/notifications";
import { useColorScheme as useTailwindColorScheme } from 'nativewind';

// Prevent the native splash from auto-hiding
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
    const router = useRouter();
    const segments = useSegments();
    const [showSplash, setShowSplash] = useState(true);

    const { setColorScheme: setTailwindScheme } = useTailwindColorScheme();

    const { isLoading, token, checkSession } = useAuthStore();

    useEffect(() => {
        checkSession();
        // Clear any previously saved manual theme override left over from old settings
        SecureStore.deleteItemAsync('theme').catch(() => {});
    }, []);

    // Tell NativeWind to follow the system theme — exactly how student-app does it
    useEffect(() => {
        setTailwindScheme('system');
    }, [setTailwindScheme]);

    // Hide the native splash screen once our animated one is showing
    useEffect(() => {
        if (showSplash) {
            SplashScreen.hideAsync();
        }
    }, [showSplash]);

    useEffect(() => {
        if (isLoading || showSplash) return;

        const inAuthGroup = segments[0] === '(auth)' || segments[0] === 'login' || segments[0] === 'register' || segments[0] === 'welcome';

        if (!token && !inAuthGroup) {
            router.replace('/welcome');
        } else if (token && inAuthGroup) {
            router.replace('/(tabs)');
            // Register for push notifications when logged in
            registerForPushNotificationsAsync().catch(err => console.error('Push registration error:', err));
        }
    }, [token, isLoading, segments, showSplash]);

    if (showSplash) {
        return <AnimatedSplash onFinish={() => setShowSplash(false)} />;
    }

    return (
        <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="login" />
            <Stack.Screen name="register" />
        </Stack>
    );
}

