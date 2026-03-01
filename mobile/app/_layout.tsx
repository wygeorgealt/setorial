import "../global.css";
import { Stack } from "expo-router";
import { useColorScheme } from "nativewind";
import { useEffect } from "react";
import { Appearance } from "react-native";

export default function RootLayout() {
    const { colorScheme, setColorScheme } = useColorScheme();

    useEffect(() => {
        // Sync NativeWind colorScheme with system theme on mount
        const systemTheme = Appearance.getColorScheme();
        if (systemTheme) {
            setColorScheme(systemTheme);
        }

        const subscription = Appearance.addChangeListener(({ colorScheme: newScheme }) => {
            if (newScheme) {
                setColorScheme(newScheme);
            }
        });

        return () => subscription.remove();
    }, [setColorScheme]);

    return (
        <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" />
        </Stack>
    );
}
