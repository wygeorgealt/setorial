import { View, Text, TouchableOpacity, ScrollView, Image, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Settings, LogOut, ChevronRight, BookOpen, Star, HelpCircle, ShieldCheck } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../../store/authStore';
import { useState, useCallback } from 'react';
import { authApi } from '../../services/api';

export default function ProfileScreen() {
    const router = useRouter();
    const { user, logout, updateUser } = useAuthStore();
    const [refreshing, setRefreshing] = useState(false);

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        try {
            const res = await authApi.getMe();
            updateUser(res.data);
        } catch (error) {
            console.error('Failed to refresh profile:', error);
        } finally {
            setRefreshing(false);
        }
    }, []);

    const handleLogout = async () => {
        await logout();
        router.replace('/welcome');
    };

    return (
        <SafeAreaView className="flex-1 bg-white dark:bg-[#0B0D12]">
            <ScrollView
                className="flex-1 px-5 pt-4"
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
            >

                <Text className="text-black dark:text-white text-[28px] font-bold tracking-tight mb-8">Manage</Text>

                {/* Profile Header */}
                <TouchableOpacity
                    onPress={() => router.push('/edit-profile')}
                    className="flex-row items-center mb-10"
                >
                    <View className="relative mr-4">
                        <View className="w-16 h-16 rounded-full bg-gray-100 dark:bg-[#1E222B] items-center justify-center overflow-hidden border border-gray-200 dark:border-[#272B36]">
                            <Image source={{ uri: user?.avatarUrl || 'https://i.pravatar.cc/150?u=placeholder' }} className="w-full h-full" />
                        </View>
                        <View className={`absolute bottom-0 right-0 w-4 h-4 border-2 border-white dark:border-[#0B0D12] rounded-full ${user?.isVerified ? 'bg-blue-500' : 'bg-green-500'}`} />
                    </View>
                    <View className="flex-1">
                        <Text className="text-black dark:text-white text-[22px] font-bold tracking-tight">{user?.name || 'Student'}</Text>
                        <Text className="text-gray-500 dark:text-gray-400 font-medium">{user?.email || 'student@setorial.com'}</Text>
                    </View>
                    <ChevronRight size={20} color="#9CA3AF" />
                </TouchableOpacity>

                {/* Action List */}
                <Text className="text-black dark:text-white font-bold text-xl tracking-tight mb-4">Account</Text>
                <View className="mb-8">
                    <ActionRow
                        icon={<BookOpen size={20} color="#000" />}
                        label="My Learning Path"
                        onPress={() => router.push('/learning-path')}
                    />
                    <ActionRow
                        icon={<Star size={20} color="#000" />}
                        label="Achievements"
                        onPress={() => router.push('/achievements')}
                    />
                    <ActionRow
                        icon={<ShieldCheck size={20} color="#000" />}
                        label="Subscription Tier"
                        onPress={() => router.push('/subscription')}
                    />
                    <ActionRow
                        icon={<ShieldCheck size={20} color="#1CB0F6" />}
                        label="Monetization & Verification"
                        onPress={() => router.push('/verification')}
                    />
                    <ActionRow
                        icon={<Settings size={20} color="#000" />}
                        label="Settings"
                        onPress={() => router.push('/settings')}
                    />
                    <ActionRow
                        icon={<HelpCircle size={20} color="#000" />}
                        label="Help Center"
                        onPress={() => router.push('/help')}
                    />
                </View>

                {/* Log Out Button */}
                <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={handleLogout}
                    className="flex-row items-center justify-center bg-white dark:bg-[#1E222B] border-2 border-[#E5E5E5] dark:border-[#272B36] border-b-4 p-4 rounded-2xl mb-10"
                >
                    <LogOut size={20} color="#FF4B4B" />
                    <Text className="text-[#FF4B4B] font-bold ml-2 text-[17px] uppercase tracking-wider">Log Out</Text>
                </TouchableOpacity>

            </ScrollView>
        </SafeAreaView>
    );
}

function ActionRow({ icon, label, onPress }: { icon: any, label: string, onPress?: () => void }) {
    return (
        <TouchableOpacity
            activeOpacity={0.8}
            onPress={onPress}
            disabled={!onPress}
            className="flex-row items-center p-5 mb-3 bg-white dark:bg-[#1E222B] border-2 border-[#E5E5E5] dark:border-[#272B36] border-b-4 rounded-2xl"
        >
            <View className="w-10 h-10 rounded-xl bg-[#F5F5F5] dark:bg-[#2A2E39] border-2 border-[#E5E5E5] dark:border-[#272B36] items-center justify-center mr-4">
                {icon}
            </View>
            <Text className="flex-1 text-[#4B4B4B] dark:text-white font-bold text-[17px]">{label}</Text>
            <ChevronRight size={20} color="#CECECE" />
        </TouchableOpacity>
    );
}
