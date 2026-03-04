import "../global.css";
import { Stack, useRouter, useSegments } from "expo-router";
import { useColorScheme } from "nativewind";
import { useEffect } from "react";
import { Appearance, View, ActivityIndicator } from "react-native";
import { useAuthStore } from "../store/authStore";
import * as SecureStore from 'expo-secure-store';

export default function RootLayout() {
    const { colorScheme, setColorScheme } = useColorScheme();
    const router = useRouter();
    const segments = useSegments();

    const { isLoading, token, checkSession } = useAuthStore();

    useEffect(() => {
        checkSession();
    }, []);

    useEffect(() => {
        if (isLoading) return;

        const inAuthGroup = segments[0] === '(auth)' || segments[0] === 'login' || segments[0] === 'register' || segments[0] === 'welcome';

        if (!token && !inAuthGroup) {
            router.replace('/welcome');
        } else if (token && inAuthGroup) {
            router.replace('/(tabs)');
        }
    }, [token, isLoading, segments]);

    useEffect(() => {
        const loadTheme = async () => {
            const savedTheme = await SecureStore.getItemAsync('theme');
            if (savedTheme === 'dark' || savedTheme === 'light') {
                setColorScheme(savedTheme);
            } else {
                const systemTheme = Appearance.getColorScheme();
                if (systemTheme) setColorScheme(systemTheme);
            }
        };
        loadTheme();

        const subscription = Appearance.addChangeListener(({ colorScheme: newScheme }) => {
            // Only auto-update if the user hasn't explicitly set a preference
            SecureStore.getItemAsync('theme').then((savedTheme) => {
                if (!savedTheme && newScheme) {
                    setColorScheme(newScheme);
                }
            });
        });

        return () => subscription.remove();
    }, [setColorScheme]);

    if (isLoading) {
        return (
            <View className="flex-1 items-center justify-center bg-background-light dark:bg-background-dark">
                <ActivityIndicator size="large" color="#3B82F6" />
            </View>
        );
    }

    return (
        <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="login" />
            <Stack.Screen name="register" />
        </Stack>
    );
}
