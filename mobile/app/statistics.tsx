import { View, Text, ScrollView, SafeAreaView, TouchableOpacity } from "react-native";
import { ChevronLeft, BarChart2, Clock, Calendar, ArrowUpRight } from "lucide-react-native";
import { useRouter } from "expo-router";
import { Svg, Rect, G } from "react-native-svg";
import { useColorScheme } from "nativewind";

export default function StatisticsScreen() {
    const router = useRouter();
    const { colorScheme } = useColorScheme();
    const isDark = colorScheme === "dark";

    const data = [20, 45, 28, 80, 99, 43, 85];
    const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    const maxVal = Math.max(...data);

    return (
        <SafeAreaView className="flex-1 bg-background-light dark:bg-background-dark">
            <View className="px-5 py-4 flex-row items-center">
                <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 bg-white dark:bg-card-dark rounded-full items-center justify-center shadow-sm">
                    <ChevronLeft size={24} color={isDark ? "#FFF" : "#000"} />
                </TouchableOpacity>
                <Text className="flex-1 text-center text-xl font-bold text-gray-900 dark:text-white mr-10">Statistics</Text>
            </View>

            <ScrollView className="flex-1 px-5 pt-4">
                <Text className="text-2xl font-bold text-gray-900 dark:text-white mb-6">This Week</Text>

                {/* Chart Card */}
                <View className="bg-card-light dark:bg-card-dark p-6 rounded-[40px] shadow-sm border border-gray-100 dark:border-gray-800 mb-8">
                    <View className="mb-8">
                        <Text className="text-gray-400 dark:text-gray-500 font-medium uppercase text-xs mb-1">Time Spent</Text>
                        <View className="flex-row items-baseline">
                            <Text className="text-3xl font-bold text-gray-900 dark:text-white">31.8</Text>
                            <Text className="text-gray-500 dark:text-gray-400 text-lg ml-2 font-medium">hours</Text>
                        </View>
                    </View>

                    {/* Simple SVG Bar Chart */}
                    <View className="h-48 flex-row items-end justify-between">
                        {data.map((item, index) => (
                            <View key={index} className="items-center flex-1">
                                <View
                                    className="w-3 rounded-full bg-primary"
                                    style={{ height: (item / maxVal) * 120, opacity: index === 4 || index === 6 ? 1 : 0.2 }}
                                />
                                <Text className="text-gray-400 dark:text-gray-500 text-[10px] mt-3 font-medium">{days[index]}</Text>
                            </View>
                        ))}
                    </View>
                </View>

                <Text className="text-lg font-bold text-gray-900 dark:text-white mb-4">My Performance</Text>

                <PerformanceItem
                    icon={<Clock size={20} color="#3B82F6" />}
                    bgColor="bg-blue-100 dark:bg-blue-900/20"
                    label="Time Spent"
                    value="31.8 hours"
                />
                <PerformanceItem
                    icon={<BarChart2 size={20} color="#F97316" />}
                    bgColor="bg-orange-100 dark:bg-orange-900/20"
                    label="Average/Day"
                    value="4.6 hours"
                />
                <PerformanceItem
                    icon={<Calendar size={20} color="#22C55E" />}
                    bgColor="bg-green-100 dark:bg-green-900/20"
                    label="Consistency"
                    value="98%"
                />

            </ScrollView>
        </SafeAreaView>
    );
}

function PerformanceItem({ icon, label, value, bgColor }: { icon: any, label: string, value: string, bgColor: string }) {
    return (
        <TouchableOpacity className="flex-row items-center bg-card-light dark:bg-card-dark p-4 rounded-3xl mb-4 border border-gray-50 dark:border-gray-800 shadow-sm">
            <View className={`${bgColor} w-12 h-12 rounded-2xl items-center justify-center mr-4`}>
                {icon}
            </View>
            <View className="flex-1">
                <Text className="text-gray-400 dark:text-gray-500 text-xs mb-1 font-medium">{label}</Text>
                <Text className="text-gray-900 dark:text-white font-bold text-base">{value}</Text>
            </View>
            <ArrowUpRight size={20} color="#94A3B8" />
        </TouchableOpacity>
    );
}
