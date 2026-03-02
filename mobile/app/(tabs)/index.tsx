import { View, Text, ScrollView, TouchableOpacity, Image, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowUpRight, ShieldCheck, CreditCard, ChevronRight, Trophy, Star } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../../store/authStore';
import { useState, useEffect, useCallback } from 'react';
import { authApi, walletApi, learningApi } from '../../services/api';

export default function HomeScreen() {
    const router = useRouter();
    const { user, token, updateUser } = useAuthStore();
    const [balance, setBalance] = useState({ ngn: 0, usd: 0 });
    const [subjects, setSubjects] = useState<any[]>([]);
    const [refreshing, setRefreshing] = useState(false);

    const fetchData = async () => {
        if (!useAuthStore.getState().token) return;
        try {
            const [profileRes, walletRes, subjectsRes] = await Promise.all([
                authApi.getMe(),
                walletApi.getBalance(),
                learningApi.getSubjects()
            ]);

            updateUser(profileRes.data);
            setBalance({
                ngn: walletRes.data.balance,
                usd: walletRes.data.balance / 1600 // Mock conversion
            });
            setSubjects(subjectsRes.data);
        } catch (error) {
            console.error('Failed to fetch dashboard data:', error);
        }
    };

    useEffect(() => {
        if (token) fetchData();
    }, [token]);

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await fetchData();
        setRefreshing(false);
    }, []);

    return (
        <SafeAreaView className="flex-1 bg-white">
            <ScrollView
                className="flex-1 px-5 pt-4 pb-20"
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
            >

                {/* Header Section */}
                <View className="flex-row items-center justify-between mb-8">
                    <Text className="text-black text-[28px] font-bold tracking-tight">Learn</Text>
                    <View className="flex-row items-center bg-gray-100 px-3 py-1.5 rounded-full">
                        <ShieldCheck size={14} color="#000" strokeWidth={2.5} />
                        <Text className="text-black font-bold text-xs ml-1 tracking-wide">{user?.tier || 'FREE'} TIER</Text>
                    </View>
                </View>

                {/* Quick Toggle (Visual Only) */}
                <View className="flex-row items-center justify-between mb-10">
                    <View className="bg-gray-100 px-3 py-1.5 rounded-full flex-row items-center">
                        <View className="w-2 h-2 rounded-full bg-green-500 mr-2" />
                        <Text className="text-gray-500 text-xs font-semibold">Active Streak {user?.streak || 0}</Text>
                    </View>
                    <View className="flex-row bg-gray-100 rounded-full p-1">
                        <TouchableOpacity className="bg-black rounded-full px-4 py-1.5 shadow-sm">
                            <Text className="text-white text-xs font-bold">Points</Text>
                        </TouchableOpacity>
                        <TouchableOpacity className="rounded-full px-4 py-1.5">
                            <Text className="text-gray-500 text-xs font-bold">Cash</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Equity / Points Section */}
                <View className="mb-8">
                    <View className="flex-row gap-x-4 mb-8">
                        <TouchableOpacity
                            onPress={() => router.push('/leaderboard')}
                            className="flex-1 bg-white p-6 rounded-[32px] shadow-sm border border-gray-100 items-center"
                        >
                            <Trophy size={28} color="#000" />
                            <Text className="text-gray-400 font-bold text-xs uppercase mt-3 tracking-widest">Points</Text>
                            <Text className="text-black font-black text-2xl">{user?.points || 0}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => router.push('/leaderboard')}
                            className="flex-1 bg-white p-6 rounded-[32px] shadow-sm border border-gray-100 items-center"
                        >
                            <Star size={28} color="#EAB308" fill="#EAB308" />
                            <Text className="text-gray-400 font-bold text-xs uppercase mt-3 tracking-widest">Streak</Text>
                            <Text className="text-black font-black text-2xl">{user?.streak || 0}</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                <View className="h-[1px] bg-gray-100 mb-8 w-full" />

                {/* Buying Power / Monetizable Balance */}
                <View className="flex-row items-center justify-between mb-10">
                    <View>
                        <Text className="text-gray-400 font-medium text-sm mb-1">Monetizable balance</Text>
                        <View className="flex-row items-center">
                            <Text className="text-black font-bold text-base">₦{balance.ngn.toLocaleString()}</Text>
                            <Text className="text-gray-300 mx-2">|</Text>
                            <Text className="text-gray-400 font-medium text-base">${balance.usd.toFixed(2)}</Text>
                        </View>
                    </View>
                    <TouchableOpacity className="bg-[#20A68A] py-2 px-6 rounded-full">
                        <Text className="text-white font-bold text-sm">Payout</Text>
                    </TouchableOpacity>
                </View>

                {/* Promo Card */}
                <View className="bg-white border text-center justify-between border-gray-200 rounded-2xl p-5 flex-row items-center shadow-sm mb-10 relative overflow-hidden">
                    <View className="w-2/3 pr-4 z-10">
                        <Text className="text-black font-black text-xl italic tracking-tighter uppercase leading-tight mb-2">
                            BECOME ELIGIBLE{'\n'}FOR REWARDS
                        </Text>
                        <Text className="text-gray-600 text-[13px] leading-5 mb-4">
                            Upgrade to Silver or Gold tier and study consistently to convert points to cash.
                        </Text>
                        <TouchableOpacity className="flex-row items-center">
                            <Text className="text-black font-bold text-sm">Upgrade now</Text>
                            <ChevronRight size={16} color="#000" />
                        </TouchableOpacity>
                    </View>
                    {/* Decorative element like the debit card in the image */}
                    <View className="absolute right-[-20px] bottom-[-20px] opacity-90">
                        <View className="w-32 h-32 bg-gray-100 rounded-2xl rotate-12 border-2 border-gray-900 justify-center items-center">
                            <Text className="text-gray-900 font-black text-3xl rotate-90">GOLD</Text>
                        </View>
                    </View>
                </View>

                {/* Holdings / Courses */}
                <View className="mb-10">
                    <Text className="text-black font-bold text-xl tracking-tight mb-4">My Courses</Text>
                    <Text className="text-gray-400 text-sm">No active courses. Scroll below to discover new subjects.</Text>
                </View>

                {/* Popular on Stake / Top Subjects */}
                <View className="mb-6">
                    <Text className="text-black font-bold text-xl tracking-tight mb-4">Top Subjects</Text>

                    <View className="flex-row justify-between mb-4 border-b border-gray-100 pb-2">
                        <Text className="text-gray-400 text-xs font-semibold">Subject</Text>
                        <View className="flex-row w-1/2 justify-between">
                            <Text className="text-gray-400 text-xs font-semibold ml-4">Topics</Text>
                            <Text className="text-gray-400 text-xs font-semibold">Popularity</Text>
                        </View>
                    </View>

                    {/* Dynamic Subjects */}
                    {subjects.length > 0 ? (
                        subjects.map((subject) => (
                            <SubjectRow
                                key={subject.id}
                                name={subject.name}
                                topics={subject.topics?.length.toString() || '0'}
                                trend="+0.0%"
                            />
                        ))
                    ) : (
                        <Text className="text-gray-400 text-sm py-4">Loading subjects...</Text>
                    )}
                </View>

            </ScrollView>
        </SafeAreaView>
    );
}

function SubjectRow({ name, topics, trend }: { name: string, topics: string, trend: string }) {
    return (
        <View className="flex-row justify-between items-center py-4 border-b border-gray-50">
            <Text className="text-black font-bold text-[15px]">{name}</Text>
            <View className="flex-row w-1/2 justify-between items-center">
                <Text className="text-black font-semibold text-[15px] ml-4">{topics}</Text>
                <View className="bg-gray-100 px-2 py-1 rounded">
                    <Text className="text-black font-bold text-xs">{trend}</Text>
                </View>
            </View>
        </View>
    );
}
