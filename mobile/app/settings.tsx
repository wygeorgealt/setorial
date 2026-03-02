import { View, Text, TouchableOpacity, ScrollView, SafeAreaView, Switch, useColorScheme } from 'react-native';
import { ChevronLeft, User, Bell, Shield, CircleHelp, Info, Moon } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useState, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';

export default function SettingsScreen() {
    const router = useRouter();
    const colorScheme = useColorScheme();
    const [notifications, setNotifications] = useState(true);
    const [darkMode, setDarkMode] = useState(colorScheme === 'dark');

    const handleDarkModeToggle = async (value: boolean) => {
        setDarkMode(value);
        await SecureStore.setItemAsync('theme', value ? 'dark' : 'light');
    };

    return (
        <SafeAreaView className="flex-1 bg-white">
            {/* Header */}
            <View className="flex-row items-center justify-between px-5 py-6">
                <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 items-center justify-center">
                    <ChevronLeft size={24} color="#000" />
                </TouchableOpacity>
                <Text className="text-black font-bold text-xl">Settings</Text>
                <View className="w-10" />
            </View>

            <ScrollView className="flex-1 px-5" showsVerticalScrollIndicator={false}>
                {/* Account Section */}
                <Text className="text-gray-400 font-bold mb-4 uppercase text-xs tracking-widest">Account</Text>
                <SettingRow
                    icon={<User size={20} color="#000" />}
                    label="Edit Profile"
                    onPress={() => router.push('/edit-profile')}
                />
                <SettingRow icon={<Bell size={20} color="#000" />} label="Notifications">
                    <Switch
                        value={notifications}
                        onValueChange={setNotifications}
                        trackColor={{ false: '#E2E8F0', true: '#000' }}
                    />
                </SettingRow>
                <SettingRow
                    icon={<Shield size={20} color="#000" />}
                    label="Security & Privacy"
                    onPress={() => router.push('/security')}
                />

                <View className="h-10" />

                {/* Appearance Section */}
                <Text className="text-gray-400 font-bold mb-4 uppercase text-xs tracking-widest">Appearance</Text>
                <SettingRow icon={<Moon size={20} color="#000" />} label="Dark Mode">
                    <Switch
                        value={darkMode}
                        onValueChange={handleDarkModeToggle}
                        trackColor={{ false: '#E2E8F0', true: '#000' }}
                    />
                </SettingRow>

                <View className="h-10" />

                {/* Support Section */}
                <Text className="text-gray-400 font-bold mb-4 uppercase text-xs tracking-widest">Support</Text>
                <SettingRow
                    icon={<CircleHelp size={20} color="#000" />}
                    label="Help Center"
                    onPress={() => router.push('/help')}
                />

                <View className="h-10" />

                {/* Legal Section */}
                <Text className="text-gray-400 font-bold mb-4 uppercase text-xs tracking-widest">Legal</Text>
                <SettingRow label="Terms of Service" onPress={() => router.push('/terms')} />
                <SettingRow label="Privacy Policy" onPress={() => router.push('/privacy')} />

                <View className="h-20" />
            </ScrollView>
        </SafeAreaView>
    );
}

function SettingRow({ icon, label, children, onPress }: { icon?: any, label: string, children?: any, onPress?: () => void }) {
    return (
        <TouchableOpacity
            onPress={onPress}
            disabled={!onPress && !children}
            className="flex-row items-center py-5 border-b border-gray-100"
        >
            {icon && <View className="mr-4">{icon}</View>}
            <Text className="flex-1 text-black font-semibold text-lg">{label}</Text>
            {children || (onPress && <ChevronLeft size={20} color="#94A3B8" style={{ transform: [{ rotate: '180deg' }] }} />)}
        </TouchableOpacity>
    );
}

