import "../global.css";
import { Stack, useRouter, useSegments } from "expo-router";
import { useColorScheme } from "nativewind";
import { useEffect, useState } from "react";
import { Appearance } from "react-native";
import { useAuthStore } from "../store/authStore";
import * as SecureStore from 'expo-secure-store';
import * as SplashScreen from 'expo-splash-screen';
import AnimatedSplash from "../components/AnimatedSplash";
import { registerForPushNotificationsAsync } from "../services/notifications";

// Prevent the native splash from auto-hiding
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
    const { colorScheme, setColorScheme } = useColorScheme();
    const router = useRouter();
    const segments = useSegments();
    const [showSplash, setShowSplash] = useState(true);

    const { isLoading, token, checkSession } = useAuthStore();

    useEffect(() => {
        checkSession();
    }, []);

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

    useEffect(() => {
        // Clear any previously saved theme override so system theme always wins
        SecureStore.deleteItemAsync('theme').catch(() => {});

        // Set initial theme from system
        const systemTheme = Appearance.getColorScheme();
        if (systemTheme) setColorScheme(systemTheme);

        // Listen for system theme changes manually
        const subscription = Appearance.addChangeListener(({ colorScheme: newScheme }) => {
            if (newScheme) setColorScheme(newScheme);
        });

        return () => subscription.remove();
    }, [setColorScheme]);

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

