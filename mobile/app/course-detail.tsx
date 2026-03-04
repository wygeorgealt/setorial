import { View, Text, Image, ScrollView, TouchableOpacity, SafeAreaView, ActivityIndicator } from "react-native";
import { ChevronLeft, Clock, Star, PlayCircle, Lock } from "lucide-react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useColorScheme } from "nativewind";
import { useState, useEffect } from "react";
import { learningApi } from "../services/api";

export default function CourseDetailScreen() {
    const router = useRouter();
    const { id } = useLocalSearchParams();
    const { colorScheme } = useColorScheme();
    const [subject, setSubject] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (id) {
            fetchSubject();
        }
    }, [id]);

    const fetchData = async () => {
        // Redundant with fetchSubject, but keep it if needed for others
    };

    const fetchSubject = async () => {
        try {
            const res = await learningApi.getSubject(id as string);
            setSubject(res.data);
        } catch (error) {
            console.error('Failed to fetch subject details:', error);
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

    if (!subject) {
        return (
            <View className="flex-1 bg-white items-center justify-center p-5">
                <Text className="text-gray-500 mb-4">Subject not found</Text>
                <TouchableOpacity onPress={() => router.back()} className="bg-black px-6 py-3 rounded-full">
                    <Text className="text-white font-bold">Go Back</Text>
                </TouchableOpacity>
            </View>
        );
    }

    const totalLessons = subject.topics?.reduce((acc: number, topic: any) => acc + (topic.lessons?.length || 0), 0) || 0;

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
                    <Text className="text-2xl font-bold text-gray-900 dark:text-white flex-1 mr-4">{subject.name}</Text>
                    <View className="bg-blue-100 dark:bg-blue-900/30 px-3 py-1.5 rounded-xl">
                        <Text className="text-blue-600 dark:text-blue-400 font-bold">FREE</Text>
                    </View>
                </View>

                <View className="flex-row items-center mb-6">
                    <View className="flex-row items-center mr-6">
                        <Clock size={16} color="#94A3B8" />
                        <Text className="text-slate-400 ml-2 font-medium">{totalLessons} topics</Text>
                    </View>
                    <View className="flex-row items-center">
                        <Star size={16} color="#F59E0B" fill="#F59E0B" />
                        <Text className="text-slate-400 ml-2 font-medium">New</Text>
                    </View>
                </View>

                <Text className="text-lg font-bold text-gray-900 dark:text-white mb-2">Course Description</Text>
                <Text className="text-gray-500 dark:text-gray-400 leading-6 mb-8">
                    In this course you will learn how to build a modern iOS app from scratch using SwiftUI and clean architecture. We cover everything from UI fundamentals to complex animations.
                </Text>

                <Text className="text-lg font-bold text-gray-900 dark:text-white mb-4">Course Content</Text>

                {subject.topics?.map((topic: any, index: number) => {
                    const firstLesson = topic.lessons?.[0];
                    const quizId = firstLesson?.quizzes?.[0]?.id;

                    return (
                        <LessonItem
                            key={topic.id}
                            title={topic.name}
                            duration={`${topic.lessons?.length || 0} lessons`}
                            isLocked={index > 0}
                            onPress={() => {
                                if (quizId) {
                                    router.push(`/quiz?id=${quizId}`);
                                } else {
                                    alert('No quiz available for this topic yet.');
                                }
                            }}
                        />
                    );
                })}

                {subject.topics?.length === 0 && (
                    <Text className="text-gray-400 text-sm italic">No topics available for this subject yet.</Text>
                )}

                <View className="h-10" />
            </ScrollView>

            {/* Floating Bottom Action */}
            <SafeAreaView className="absolute bottom-0 left-0 right-0 p-5 bg-white/95 dark:bg-background-dark/95 backdrop-blur-md border-t border-gray-100 dark:border-gray-800">
                <TouchableOpacity
                    activeOpacity={0.8}
                    className="bg-[#1CB0F6] p-4 rounded-2xl items-center border-b-4 border-[#1899D6] border-t-[#1CB0F6] border-l-[#1CB0F6] border-r-[#1CB0F6]"
                >
                    <Text className="text-white font-bold text-[17px] uppercase tracking-wider">Start Learning</Text>
                </TouchableOpacity>
            </SafeAreaView>
        </View>
    );
}

function LessonItem({ title, duration, isLocked, onPress }: { title: string, duration: string, isLocked?: boolean, onPress: () => void }) {
    return (
        <TouchableOpacity
            onPress={onPress}
            disabled={isLocked}
            className="flex-row items-center bg-gray-50 dark:bg-card-dark p-5 rounded-3xl mb-4 border border-gray-100 dark:border-gray-800"
        >
            <View className="w-10 h-10 rounded-2xl bg-white dark:bg-gray-800 items-center justify-center mr-4">
                {isLocked ? <Lock size={18} color="#94A3B8" /> : <PlayCircle size={18} color="#000" />}
            </View>
            <View className="flex-1">
                <Text className={`font-bold ${isLocked ? 'text-gray-400' : 'text-gray-900 dark:text-white'}`}>{title}</Text>
                <Text className="text-gray-400 text-xs mt-1">{duration}</Text>
            </View>
            <ChevronLeft size={20} color="#94A3B8" style={{ transform: [{ rotate: '180deg' }] }} />
        </TouchableOpacity>
    );
}
