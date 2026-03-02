import { View, Text, ScrollView, TouchableOpacity, SafeAreaView } from 'react-native';
import { ChevronLeft, Flame, BookOpen, Trophy, Star, Crown, Target, Zap } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../store/authStore';

const BADGES = [
    {
        id: 'first_quiz',
        title: 'First Steps',
        description: 'Complete your first quiz',
        icon: Zap,
        color: '#3B82F6',
        requirement: (user: any) => (user?.points || 0) > 0,
    },
    {
        id: 'five_subjects',
        title: 'Explorer',
        description: 'Study 5 different subjects',
        icon: BookOpen,
        color: '#8B5CF6',
        requirement: () => false,
    },
    {
        id: '100_points',
        title: 'Century',
        description: 'Earn 100 points',
        icon: Trophy,
        color: '#EAB308',
        requirement: (user: any) => (user?.points || 0) >= 100,
    },
    {
        id: 'streak_7',
        title: 'On Fire',
        description: 'Maintain a 7-day streak',
        icon: Flame,
        color: '#EF4444',
        requirement: (user: any) => (user?.streak || 0) >= 7,
    },
    {
        id: 'streak_30',
        title: 'Unstoppable',
        description: 'Maintain a 30-day streak',
        icon: Target,
        color: '#F97316',
        requirement: (user: any) => (user?.streak || 0) >= 30,
    },
    {
        id: 'gold_tier',
        title: 'Gold Standard',
        description: 'Reach Gold tier',
        icon: Crown,
        color: '#EAB308',
        requirement: (user: any) => user?.tier === 'GOLD',
    },
    {
        id: '500_points',
        title: 'Half Grand',
        description: 'Earn 500 points',
        icon: Star,
        color: '#14B8A6',
        requirement: (user: any) => (user?.points || 0) >= 500,
    },
];

export default function AchievementsScreen() {
    const router = useRouter();
    const { user } = useAuthStore();

    const earned = BADGES.filter(b => b.requirement(user));
    const locked = BADGES.filter(b => !b.requirement(user));

    return (
        <SafeAreaView className="flex-1 bg-white">
            <View className="flex-row items-center justify-between px-5 py-6">
                <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 items-center justify-center">
                    <ChevronLeft size={24} color="#000" />
                </TouchableOpacity>
                <Text className="text-black font-bold text-xl">Achievements</Text>
                <View className="w-10" />
            </View>

            <ScrollView className="flex-1 px-5" showsVerticalScrollIndicator={false}>
                {/* Summary */}
                <View className="bg-black p-8 rounded-[40px] mb-10 items-center">
                    <Text className="text-gray-400 font-bold text-sm uppercase tracking-widest mb-2">Badges Earned</Text>
                    <Text className="text-white font-black text-[56px] tracking-tighter">{earned.length}</Text>
                    <Text className="text-gray-500 font-medium">of {BADGES.length} total</Text>
                </View>

                {/* Earned Badges */}
                {earned.length > 0 && (
                    <>
                        <Text className="text-black font-bold text-lg mb-4">Unlocked</Text>
                        <View className="flex-row flex-wrap gap-4 mb-10">
                            {earned.map((badge) => {
                                const Icon = badge.icon;
                                return (
                                    <View key={badge.id} className="w-[47%] bg-gray-50 p-5 rounded-[28px] border border-gray-100">
                                        <View
                                            style={{ backgroundColor: badge.color + '20' }}
                                            className="w-14 h-14 rounded-2xl items-center justify-center mb-3"
                                        >
                                            <Icon size={28} color={badge.color} />
                                        </View>
                                        <Text className="text-black font-bold mb-1">{badge.title}</Text>
                                        <Text className="text-gray-400 text-xs">{badge.description}</Text>
                                    </View>
                                );
                            })}
                        </View>
                    </>
                )}

                {/* Locked Badges */}
                {locked.length > 0 && (
                    <>
                        <Text className="text-gray-400 font-bold text-lg mb-4">Locked</Text>
                        <View className="flex-row flex-wrap gap-4 mb-20">
                            {locked.map((badge) => {
                                const Icon = badge.icon;
                                return (
                                    <View key={badge.id} className="w-[47%] bg-gray-50/50 p-5 rounded-[28px] border border-gray-100 opacity-50">
                                        <View className="w-14 h-14 rounded-2xl items-center justify-center mb-3 bg-gray-100">
                                            <Icon size={28} color="#94A3B8" />
                                        </View>
                                        <Text className="text-gray-400 font-bold mb-1">{badge.title}</Text>
                                        <Text className="text-gray-300 text-xs">{badge.description}</Text>
                                    </View>
                                );
                            })}
                        </View>
                    </>
                )}
            </ScrollView>
        </SafeAreaView>
    );
}
