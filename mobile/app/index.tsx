import { View, Text, TouchableOpacity, Image, ScrollView, SafeAreaView } from "react-native";
import { User, BookOpen, Wallet, ChevronRight, BarChart2, CheckCircle2, Clock, Trophy } from "lucide-react-native";
import { useColorScheme } from "nativewind";

export default function HomeScreen() {
    const { colorScheme } = useColorScheme();
    const isDark = colorScheme === "dark";

    return (
        <SafeAreaView className="flex-1 bg-background-light dark:bg-background-dark">
            <ScrollView className="flex-1 px-5 pt-8">
                {/* Header - Profile Section */}
                <View className="flex-row items-center justify-between mb-8">
                    <View>
                        <Text className="text-gray-500 font-medium dark:text-gray-400">Welcome back,</Text>
                        <Text className="text-2xl font-bold text-gray-900 dark:text-white">Sally Robins</Text>
                    </View>
                    <View className="relative">
                        <View className="w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-700 items-center justify-center overflow-hidden border-2 border-primary">
                            <User size={24} color={isDark ? "#FFF" : "#000"} />
                        </View>
                        <View className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white dark:border-background-dark" />
                    </View>
                </View>

                {/* Stats Grid */}
                <View className="flex-row gap-x-4 mb-8">
                    <View className="flex-1 bg-card-light dark:bg-card-dark p-4 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800">
                        <View className="bg-blue-100 dark:bg-blue-900/30 w-10 h-10 rounded-2xl items-center justify-center mb-3">
                            <BookOpen size={20} color="#3B82F6" />
                        </View>
                        <Text className="text-gray-900 dark:text-white text-lg font-bold">0</Text>
                        <Text className="text-gray-500 dark:text-gray-400 text-xs">My Courses</Text>
                    </View>

                    <View className="flex-1 bg-card-light dark:bg-card-dark p-4 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800">
                        <View className="bg-purple-100 dark:bg-purple-900/30 w-10 h-10 rounded-2xl items-center justify-center mb-3">
                            <User size={20} color="#A855F7" />
                        </View>
                        <Text className="text-gray-900 dark:text-white text-lg font-bold">2</Text>
                        <Text className="text-gray-500 dark:text-gray-400 text-xs">Followers</Text>
                    </View>

                    <View className="flex-1 bg-card-light dark:bg-card-dark p-4 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800">
                        <View className="bg-orange-100 dark:bg-orange-900/30 w-10 h-10 rounded-2xl items-center justify-center mb-3">
                            <Trophy size={20} color="#F97316" />
                        </View>
                        <Text className="text-gray-900 dark:text-white text-lg font-bold">32</Text>
                        <Text className="text-gray-500 dark:text-gray-400 text-xs">Skills</Text>
                    </View>
                </View>

                {/* Total Statistics Section */}
                <Text className="text-lg font-bold text-gray-900 dark:text-white mb-4">Total Statistics</Text>

                <View className="bg-card-light dark:bg-card-dark rounded-3xl p-2 mb-8 shadow-sm border border-gray-100 dark:border-gray-800">
                    <StatItem icon={<CheckCircle2 size={18} color="#3B82F6" />} label="Finished Courses" value="3" color="text-blue-500" />
                    <StatItem icon={<Clock size={18} color="#F97316" />} label="Hours Learned" value="56" color="text-orange-500" />
                    <StatItem icon={<Trophy size={18} color="#22C55E" />} label="Skills Achieved" value="7" color="text-green-500" />
                </View>

                {/* Featured Card from Image */}
                <Text className="text-lg font-bold text-gray-900 dark:text-white mb-4">My Performance</Text>
                <TouchableOpacity className="bg-primary dark:bg-primary-dark p-6 rounded-[40px] flex-row items-center justify-between mb-10 overflow-hidden">
                    <View>
                        <Text className="text-white/80 font-medium mb-1">Weekly Goal</Text>
                        <Text className="text-white text-2xl font-bold">31.8 hours</Text>
                    </View>
                    <View className="bg-white/20 p-4 rounded-3xl">
                        <BarChart2 size={24} color="#FFF" />
                    </View>
                </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>
    );
}

function StatItem({ icon, label, value, color }: { icon: any, label: string, value: string, color: string }) {
    return (
        <View className="flex-row items-center justify-between p-4 border-b border-gray-50 dark:border-gray-800 last:border-0">
            <View className="flex-row items-center">
                <View className="mr-3">{icon}</View>
                <Text className="text-gray-700 dark:text-gray-300 font-medium">{label}</Text>
            </View>
            <Text className={`font-bold text-lg ${color}`}>{value}</Text>
        </View>
    );
}
