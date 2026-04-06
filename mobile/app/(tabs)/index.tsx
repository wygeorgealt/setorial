import { View, Text, ScrollView, TouchableOpacity, Image, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowUpRight, ShieldCheck, CreditCard, ChevronRight, Trophy, Star, Clock } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../../store/authStore';
import { useState, useEffect, useCallback } from 'react';
import { authApi, walletApi, learningApi } from '../../services/api';
import { getTierColors } from '../../utils/theme';
import { ScaleButton } from '../../components/ScaleButton';

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
                usd: walletRes.data.balance / (walletRes.data.exchangeRate || 1600)
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

    const theme = getTierColors(user?.tier);

    return (
        <SafeAreaView className="flex-1 bg-white dark:bg-[#0B0D12]">
            <ScrollView
                className="flex-1 px-5 pt-4 pb-20"
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
            >

                {/* Header Section (Duolingo Style Top Bar) */}
                <View className="flex-row items-center justify-between mb-8 pb-4 border-b-2 border-[#E5E5E5] dark:border-[#272B36]">
                    <View className="flex-row items-center flex-1">
                        <ShieldCheck
                            size={28}
                            color={theme.primary}
                        />
                        <Text
                            className="font-black text-lg ml-2 tracking-tighter"
                            style={{ color: theme.primary }}
                        >
                            {user?.tier || 'FREE'}
                        </Text>
                    </View>
                    <View className="flex-row items-center">
                        <TouchableOpacity
                            activeOpacity={0.7}
                            onPress={() => router.push('/achievements')}
                            className="flex-row items-center mr-6"
                        >
                            <Star size={22} color="#FF9600" fill="#FF9600" />
                            <Text className="text-[#FF9600] font-bold text-lg ml-1">{user?.streak || 0}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            activeOpacity={0.7}
                            onPress={() => router.push('/leaderboard')}
                            className="flex-row items-center"
                        >
                            <Trophy size={22} color="#1CB0F6" fill="#1CB0F6" />
                            <Text className="text-[#1CB0F6] font-bold text-lg ml-1">{user?.points || 0}</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Buying Power / Monetizable Balance */}
                {['SILVER', 'GOLD'].includes(user?.tier || '') && (
                    <View className="flex-row items-center justify-between mb-8 bg-white dark:bg-[#1E222B] border-2 border-[#E5E5E5] dark:border-[#272B36] p-5 rounded-2xl border-b-4">
                        <View>
                            <Text className="text-[#AFAFAF] dark:text-gray-400 font-bold text-xs uppercase tracking-widest mb-1">Wallet Balance</Text>
                            <View className="flex-row items-center">
                                <Text className="text-[#4B4B4B] dark:text-white font-bold text-lg">₦{balance.ngn.toLocaleString()}</Text>
                                <Text className="text-gray-300 dark:text-gray-600 mx-2">|</Text>
                                <Text className="text-[#4B4B4B] dark:text-white font-medium text-lg">${balance.usd.toFixed(2)}</Text>
                            </View>
                        </View>
                        <ScaleButton
                            onPress={() => router.push('/payout-history')}
                            className="py-3 px-6 rounded-xl border-b-4 border-opacity-80"
                            style={{ backgroundColor: theme.primary, borderColor: theme.primaryDark }}
                        >
                            <Text className="text-white font-bold text-[13px] tracking-widest uppercase">History</Text>
                        </ScaleButton>
                    </View>
                )}

                {/* Promo Card -> Duolingo Style Super Card */}
                {!['SILVER', 'GOLD'].includes(user?.tier || '') && (
                    <ScaleButton
                        onPress={() => {}} // User hasn't specified upgrade path yet
                        className="bg-[#FFC800] border-2 border-b-4 border-[#E5B400] border-t-[#FFC800] border-x-[#FFC800] rounded-2xl p-6 flex-row items-center mb-10 overflow-hidden relative"
                    >
                        <View className="w-2/3 pr-4 z-10">
                            <Text className="text-white font-black text-2xl tracking-tight leading-tight mb-2">
                                BECOME ELIGIBLE{'\n'}FOR REWARDS
                            </Text>
                            <Text className="text-yellow-800 text-[15px] font-bold mb-4">
                                Upgrade to Silver or Gold tier to monetize your points.
                            </Text>
                            <View className="bg-white dark:bg-zinc-950 px-5 py-3 rounded-xl self-start border-b-4 border-gray-200 dark:border-zinc-800">
                                <Text className="text-[#FFC800] font-bold text-[15px] uppercase tracking-wider">Upgrade now</Text>
                            </View>
                        </View>
                        <View className="absolute right-[-10px] bottom-[-20px] opacity-70">
                            <Trophy size={140} color="#E5B400" />
                        </View>
                    </ScaleButton>
                )}

                {/* Mock Exams Access */}
                <View className="mb-10">
                    <Text className="text-black dark:text-white font-bold text-xl tracking-tight mb-4">Preparation</Text>
                    <ScaleButton
                        onPress={() => router.push('/mock-exams')}
                        className="bg-white dark:bg-[#1E222B] border-2 border-[#E5E5E5] dark:border-[#272B36] p-5 rounded-2xl border-b-4 flex-row items-center justify-between"
                    >
                        <View className="flex-1 mr-4">
                            <Text className="text-[#4B4B4B] dark:text-white font-bold text-lg mb-1">Standardized Mocks</Text>
                            <Text className="text-gray-500 dark:text-gray-400">Take timed, full-length simulation exams to earn huge points.</Text>
                        </View>
                        <View className="w-12 h-12 rounded-full bg-blue-50 dark:bg-blue-900/30 items-center justify-center border-2 border-[#1CB0F6]">
                            <Clock size={24} color="#1CB0F6" />
                        </View>
                    </ScaleButton>
                </View>


                {/* Popular on Stake / Top Subjects */}
                <View className="mb-6">
                    <Text className="text-black dark:text-white font-bold text-xl tracking-tight mb-6">Explore Subjects</Text>

                    {/* Dynamic Subjects */}
                    {subjects.length > 0 ? (
                        subjects.map((subject, index) => {
                            const colors = [
                                { bg: '#58CC02', border: '#58A700' }, // Green
                                { bg: '#1CB0F6', border: '#1899D6' }, // Blue
                                { bg: '#CE82FF', border: '#A552DE' }, // Purple
                                { bg: '#FF4B4B', border: '#EA2B2B' }, // Red
                            ];
                            const theme = colors[index % colors.length];

                            return (
                                <ScaleButton
                                    key={subject.id}
                                    onPress={() => router.push(`/course-detail?id=${subject.id}`)}
                                    className="p-5 rounded-2xl mb-4 border-2 border-b-4 flex-row items-center justify-between overflow-hidden"
                                    style={{
                                        backgroundColor: theme.bg,
                                        borderColor: theme.border,
                                        borderTopColor: theme.bg,
                                        borderLeftColor: theme.bg,
                                        borderRightColor: theme.bg
                                    }}
                                >
                                    <View>
                                        <Text className="text-white font-bold text-2xl mb-1">{subject.name}</Text>
                                        <Text className="text-white/80 font-bold text-sm tracking-wider uppercase">
                                            {subject.topics?.length || 0} Topics
                                        </Text>
                                    </View>
                                    <View className="w-12 h-12 bg-black/10 dark:bg-black/20 rounded-full items-center justify-center">
                                        <ArrowUpRight size={24} color="#FFF" />
                                    </View>
                                </ScaleButton>
                            )
                        })
                    ) : (
                        <Text className="text-[#AFAFAF] font-bold text-[17px] text-center py-10">Loading subjects...</Text>
                    )}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}
