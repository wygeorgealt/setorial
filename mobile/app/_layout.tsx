import "../global.css";
import { Stack, useRouter, useSegments } from "expo-router";
import { useEffect, useState } from "react";
import { useAuthStore } from "../store/authStore";
import * as SecureStore from 'expo-secure-store';
import * as SplashScreen from 'expo-splash-screen';
import AnimatedSplash from "../components/AnimatedSplash";
import { registerForPushNotificationsAsync } from "../services/notifications";
import { useColorScheme as useTailwindColorScheme } from 'nativewind';
import { StyleSheet, View } from "react-native";

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

    // Tell NativeWind to follow the system theme
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

        const inAuthGroup = segments[0] === '(auth)' || 
                            segments[0] === 'login' || 
                            segments[0] === 'register' || 
                            segments[0] === 'welcome' || 
                            segments[0] === 'onboarding' || 
                            segments[0] === 'verify-email' || 
                            segments[0] === 'forgot-password';

        if (!token && !inAuthGroup) {
            router.replace('/welcome');
        } else if (token && inAuthGroup) {
            router.replace('/(tabs)');
            // Register for push notifications when logged in
            registerForPushNotificationsAsync().catch(err => console.error('Push registration error:', err));
        }
    }, [token, isLoading, segments, showSplash]);

    return (
        <View style={StyleSheet.absoluteFill}>
            {/* Stack always mounted so NavigationContainer always exists */}
            <Stack screenOptions={{ headerShown: false }}>
                <Stack.Screen name="(tabs)" />
                <Stack.Screen name="login" />
                <Stack.Screen name="register" />
                <Stack.Screen name="welcome" />
                <Stack.Screen name="onboarding" />
                <Stack.Screen name="verify-email" />
                <Stack.Screen name="forgot-password" />
                <Stack.Screen name="subscription" />
                <Stack.Screen name="level" />
                <Stack.Screen name="course-detail" />
                <Stack.Screen name="active-mock" />
                <Stack.Screen name="mock-exams" />
                <Stack.Screen name="learning-path" />
                <Stack.Screen name="leaderboard" />
                <Stack.Screen name="achievements" />
                <Stack.Screen name="edit-profile" />
                <Stack.Screen name="security" />
                <Stack.Screen name="payout-history" />
                <Stack.Screen name="settings" />
                <Stack.Screen name="help" />
                <Stack.Screen name="about" />
                <Stack.Screen name="privacy" />
                <Stack.Screen name="terms" />
                <Stack.Screen name="verification" />
            </Stack>

            {/* Splash overlaid on top — disappears when video finishes */}
            {showSplash && (
                <View style={[StyleSheet.absoluteFill, { zIndex: 999 }]}>
                    <AnimatedSplash onFinish={() => setShowSplash(false)} />
                </View>
            )}
        </View>
    );
}
