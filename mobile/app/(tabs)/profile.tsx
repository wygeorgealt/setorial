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
        <SafeAreaView className="flex-1 bg-white">
            <ScrollView
                className="flex-1 px-5 pt-4"
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
            >

                <Text className="text-black text-[28px] font-bold tracking-tight mb-8">Manage</Text>

                {/* Profile Header */}
                <TouchableOpacity
                    onPress={() => router.push('/edit-profile')}
                    className="flex-row items-center mb-10"
                >
                    <View className="relative mr-4">
                        <View className="w-16 h-16 rounded-full bg-gray-100 items-center justify-center overflow-hidden border border-gray-200">
                            <Image source={{ uri: user?.avatarUrl || 'https://i.pravatar.cc/150?u=placeholder' }} className="w-full h-full" />
                        </View>
                        <View className={`absolute bottom-0 right-0 w-4 h-4 border-2 border-white rounded-full ${user?.isVerified ? 'bg-blue-500' : 'bg-green-500'}`} />
                    </View>
                    <View className="flex-1">
                        <Text className="text-black text-[22px] font-bold tracking-tight">{user?.name || 'Student'}</Text>
                        <Text className="text-gray-500 font-medium">{user?.email || 'student@setorial.com'}</Text>
                    </View>
                    <ChevronRight size={20} color="#9CA3AF" />
                </TouchableOpacity>

                {/* Action List */}
                <Text className="text-black font-bold text-xl tracking-tight mb-4">Account</Text>
                <View className="border-t border-gray-100 mb-8">
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
                    onPress={handleLogout}
                    className="flex-row items-center justify-center bg-gray-100 p-4 rounded-full mb-10"
                >
                    <LogOut size={20} color="#000" />
                    <Text className="text-black font-bold ml-2 text-[15px]">Log Out</Text>
                </TouchableOpacity>

            </ScrollView>
        </SafeAreaView>
    );
}

function ActionRow({ icon, label, onPress }: { icon: any, label: string, onPress?: () => void }) {
    return (
        <TouchableOpacity
            onPress={onPress}
            disabled={!onPress}
            className="flex-row items-center py-5 border-b border-gray-100"
        >
            <View className="w-8 items-center mr-2">
                {icon}
            </View>
            <Text className="flex-1 text-black font-semibold text-[16px]">{label}</Text>
            <ChevronRight size={20} color="#9CA3AF" />
        </TouchableOpacity>
    );
}
