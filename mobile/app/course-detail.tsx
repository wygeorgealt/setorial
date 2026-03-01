import { View, Text, Image, ScrollView, TouchableOpacity, SafeAreaView } from "react-native";
import { ChevronLeft, Clock, Star, PlayCircle, Lock } from "lucide-react-native";
import { useRouter } from "expo-router";
import { useColorScheme } from "nativewind";

export default function CourseDetailScreen() {
    const router = useRouter();
    const { colorScheme } = useColorScheme();
    const isDark = colorScheme === "dark";

    return (
        <View className="flex-1 bg-white dark:bg-background-dark">
            {/* Hero Image Section */}
            <View className="h-2/5 w-full relative">
                <Image
                    source={{ uri: 'https://images.unsplash.com/photo-1587620962725-abab7fe55159?w=800&q=80' }}
                    className="w-full h-full"
                    resizeMode="cover"
                />
                <SafeAreaView className="absolute top-4 left-5">
                    <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 bg-black/30 rounded-full items-center justify-center">
                        <ChevronLeft size={24} color="#FFF" />
                    </TouchableOpacity>
                </SafeAreaView>

                {/* Tutor Floating Badge */}
                <View className="absolute -bottom-6 left-5 flex-row items-center bg-white dark:bg-card-dark p-2 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-800">
                    <View className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden mr-3">
                        <Image source={{ uri: 'https://i.pravatar.cc/100?u=tom' }} className="w-full h-full" />
                    </View>
                    <Text className="text-gray-700 dark:text-white font-bold mr-2 text-sm">Tom Collins</Text>
                </View>
            </View>

            <ScrollView className="flex-1 px-5 pt-12 pb-10">
                <View className="flex-row items-center justify-between mb-4">
                    <Text className="text-2xl font-bold text-gray-900 dark:text-white flex-1 mr-4">Building iOS 15 App with SwiftUI</Text>
                    <View className="bg-blue-100 dark:bg-blue-900/30 px-3 py-1.5 rounded-xl">
                        <Text className="text-blue-600 dark:text-blue-400 font-bold">$24</Text>
                    </View>
                </View>

                <View className="flex-row items-center mb-6">
                    <View className="flex-row items-center mr-6">
                        <Clock size={16} color="#94A3B8" />
                        <Text className="text-slate-400 ml-2 font-medium">1h 13m</Text>
                    </View>
                    <View className="flex-row items-center">
                        <Star size={16} color="#F59E0B" fill="#F59E0B" />
                        <Text className="text-slate-400 ml-2 font-medium">5.0/5.0</Text>
                    </View>
                </View>

                <Text className="text-lg font-bold text-gray-900 dark:text-white mb-2">Course Description</Text>
                <Text className="text-gray-500 dark:text-gray-400 leading-6 mb-8">
                    In this course you will learn how to build a modern iOS app from scratch using SwiftUI and clean architecture. We cover everything from UI fundamentals to complex animations.
                </Text>

                <Text className="text-lg font-bold text-gray-900 dark:text-white mb-4">Course Overview</Text>

                <LessonItem title="Introduction" duration="1 video" isCompleted={true} />
                <LessonItem title="1. Software Setup" duration="3 videos" isLocked={false} />
                <LessonItem title="2. UI Fundamentals" duration="6 videos" isLocked={true} />
                <LessonItem title="3. Testing and Finishing" duration="2 videos" isLocked={true} />

                <View className="h-10" />
            </ScrollView>

            {/* Floating Bottom Action */}
            <SafeAreaView className="absolute bottom-0 left-0 right-0 p-5 bg-white/80 dark:bg-background-dark/80 backdrop-blur-md">
                <TouchableOpacity className="bg-primary p-5 rounded-3xl items-center shadow-lg">
                    <Text className="text-white font-bold text-lg">Enroll Now</Text>
                </TouchableOpacity>
            </SafeAreaView>
        </View>
    );
}

function LessonItem({ title, duration, isCompleted, isLocked }: { title: string, duration: string, isCompleted?: boolean, isLocked?: boolean }) {
    return (
        <TouchableOpacity className="flex-row items-center bg-gray-50 dark:bg-card-dark p-5 rounded-3xl mb-4 border border-gray-100 dark:border-gray-800">
            <View className="w-10 h-10 rounded-2xl bg-white dark:bg-gray-800 items-center justify-center mr-4">
                {isLocked ? <Lock size={18} color="#94A3B8" /> : <PlayCircle size={18} color="#3B82F6" />}
            </View>
            <View className="flex-1">
                <Text className={`font-bold ${isLocked ? 'text-gray-400' : 'text-gray-900 dark:text-white'}`}>{title}</Text>
                <Text className="text-gray-400 text-xs mt-1">{duration}</Text>
            </View>
            <ChevronLeft size={20} color="#94A3B8" style={{ transform: [{ rotate: '180deg' }] }} />
        </TouchableOpacity>
    );
}
