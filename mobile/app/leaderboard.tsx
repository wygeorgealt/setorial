import { View, Text, ScrollView, TouchableOpacity, SafeAreaView, ActivityIndicator, Image } from "react-native";
import { ChevronLeft, Trophy, Crown, Medal } from "lucide-react-native";
import { useRouter } from "expo-router";
import { useState, useEffect } from "react";
import { gamificationApi } from "../services/api";

function LeaderboardScreen() {
    const router = useRouter();
    const [leaderboard, setLeaderboard] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchLeaderboard();
    }, []);

    const fetchLeaderboard = async () => {
        try {
            const res = await gamificationApi.getLeaderboard();
            setLeaderboard(res.data);
        } catch (error) {
            console.error('Failed to fetch leaderboard:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <View className="flex-1 bg-white items-center justify-center">
                <ActivityIndicator size="large" color="#000" />
            </View>
        );
    }

    const topThree = leaderboard.slice(0, 3);
    const others = leaderboard.slice(3);

    return (
        <SafeAreaView className="flex-1 bg-white">
            <View className="flex-1 px-5">
                {/* Header */}
                <View className="flex-row items-center justify-between py-6">
                    <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 items-center justify-center">
                        <ChevronLeft size={24} color="#000" />
                    </TouchableOpacity>
                    <Text className="text-black font-bold text-xl">Global Leaderboard</Text>
                    <View className="w-10" />
                </View>

                <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
                    {/* Podium Section */}
                    <View className="flex-row items-end justify-center mb-10 pt-6">
                        {/* 2nd Place */}
                        {topThree[1] && (
                            <PodiumItem
                                user={topThree[1]}
                                rank={2}
                                height={140}
                                color="bg-gray-100"
                                icon={<Medal size={20} color="#94A3B8" />}
                            />
                        )}
                        {/* 1st Place */}
                        {topThree[0] && (
                            <PodiumItem
                                user={topThree[0]}
                                rank={1}
                                height={180}
                                color="bg-yellow-100"
                                icon={<Crown size={24} color="#EAB308" />}
                            />
                        )}
                        {/* 3rd Place */}
                        {topThree[2] && (
                            <PodiumItem
                                user={topThree[2]}
                                rank={3}
                                height={120}
                                color="bg-orange-50"
                                icon={<Medal size={20} color="#92400E" />}
                            />
                        )}
                    </View>

                    {/* Others List */}
                    <View className="bg-gray-50 rounded-[40px] p-6 mb-10 min-h-[400px]">
                        <Text className="text-gray-400 font-bold mb-6 text-sm">TOP PERFORMERS</Text>
                        {others.map((item, index) => (
                            <View key={item.id} className="flex-row items-center justify-between mb-6">
                                <View className="flex-row items-center">
                                    <Text className="text-gray-400 font-bold w-6">{index + 4}</Text>
                                    <View className="w-12 h-12 rounded-full bg-white mr-4 overflow-hidden border border-gray-100 p-0.5">
                                        <Image source={{ uri: item.avatarUrl || `https://i.pravatar.cc/100?u=${item.id}` }} className="w-full h-full rounded-full" />
                                    </View>
                                    <View>
                                        <Text className="text-black font-bold text-[15px]">{item.name || 'Student'}</Text>
                                        <Text className="text-gray-400 text-xs font-medium">Rank #{index + 4}</Text>
                                    </View>
                                </View>
                                <View className="bg-white px-4 py-2 rounded-full border border-gray-100">
                                    <Text className="text-black font-bold ml-2">{item.points} pts</Text>
                                </View>
                            </View>
                        ))}
                    </View>
                </ScrollView>
            </View>
        </SafeAreaView>
    );
}

function PodiumItem({ user, rank, height, color, icon }: any) {
    return (
        <View className="items-center mx-1">
            <View className="relative mb-4">
                <View className={`w-16 h-16 rounded-full border-4 border-white overflow-hidden shadow-sm ${color}`}>
                    <Image source={{ uri: user.avatarUrl || `https://i.pravatar.cc/100?u=${user.id}` }} className="w-full h-full" />
                </View>
                <View className="absolute top-[-15] self-center">
                    {icon}
                </View>
            </View>
            <View style={{ height }} className={`${color} w-24 rounded-t-3xl items-center pt-4 shadow-sm`}>
                <Text className="text-black font-bold mb-1">{rank === 1 ? 'Winner' : rank === 2 ? 'Silver' : 'Bronze'}</Text>
                <Text className="text-black font-extrabold text-xl">{user.points}</Text>
                <Text className="text-black/40 text-[10px] font-bold mt-1 uppercase">{user.name?.split(' ')[0] || 'User'}</Text>
            </View>
        </View>
    );
}

export default LeaderboardScreen;
