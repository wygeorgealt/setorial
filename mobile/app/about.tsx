import { View, Text, SafeAreaView, TouchableOpacity, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { useColorScheme } from "nativewind";
import { ChevronLeft, Info, HelpCircle, ShieldCheck } from "lucide-react-native";

export default function AboutScreen() {
    const router = useRouter();
    const { colorScheme } = useColorScheme();
    const isDark = colorScheme === "dark";

    return (
        <SafeAreaView className="flex-1 bg-background-light dark:bg-background-dark">
            <View className="px-5 py-4 flex-row items-center">
                <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 bg-white dark:bg-card-dark rounded-full items-center justify-center shadow-sm">
                    <ChevronLeft size={24} color={isDark ? "#FFF" : "#000"} />
                </TouchableOpacity>
                <Text className="flex-1 text-center text-xl font-bold text-gray-900 dark:text-white mr-10">About Setorial</Text>
            </View>

            <ScrollView className="flex-1 px-8 pt-10">
                <View className="items-center mb-12">
                    <View className="w-20 h-20 bg-primary/10 rounded-3xl items-center justify-center mb-6">
                        <Info size={40} color="#3B82F6" />
                    </View>
                    <Text className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Version 1.0.0</Text>
                    <Text className="text-gray-500 dark:text-gray-400 text-center">Built for students who want to excel in their sectors through focused learning and gamified competition.</Text>
                </View>

                <AboutLink icon={<HelpCircle size={20} color="#64748B" />} label="Help & Support" />
                <AboutLink icon={<ShieldCheck size={20} color="#64748B" />} label="Privacy Policy" />
                <AboutLink icon={<Info size={20} color="#64748B" />} label="Terms of Service" />

                <View className="mt-20 items-center">
                    <Text className="text-gray-400 text-xs">© 2026 Setorial Inc. All rights reserved.</Text>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

function AboutLink({ icon, label }: { icon: any, label: string }) {
    return (
        <TouchableOpacity className="flex-row items-center bg-white dark:bg-card-dark p-5 rounded-2xl mb-4 border border-gray-100 dark:border-gray-800 shadow-sm">
            <View className="mr-4">{icon}</View>
            <Text className="flex-1 text-gray-700 dark:text-white font-bold">{label}</Text>
            <ChevronLeft size={18} color="#94A3B8" style={{ transform: [{ rotate: '180deg' }] }} />
        </TouchableOpacity>
    );
}
