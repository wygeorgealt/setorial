import { View, Text, ScrollView, TouchableOpacity, SafeAreaView, ActivityIndicator } from "react-native";
import { ChevronLeft, Star, Lock, CheckCircle2 } from "lucide-react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useState, useEffect } from "react";
import { learningApi } from "../services/api";

export default function CourseDetailScreen() {
    const router = useRouter();
    const { id } = useLocalSearchParams();
    const [subject, setSubject] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (id) fetchSubject();
    }, [id]);

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
            <View className="flex-1 bg-white dark:bg-[#0B0D12] items-center justify-center">
                <ActivityIndicator size="large" color="#58CC02" />
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

    return (
        <SafeAreaView className="flex-1 bg-[#F5F5F5] dark:bg-[#0B0D12]">
            {/* Header */}
            <View className="flex-row items-center p-5 bg-white dark:bg-[#1E222B] shadow-sm z-10 border-b-2 border-gray-100 dark:border-gray-800">
                <TouchableOpacity onPress={() => router.back()} className="mr-4">
                    <ChevronLeft size={28} color="#AFAFAF" />
                </TouchableOpacity>
                <Text className="text-2xl font-black text-gray-900 dark:text-white flex-1">{subject.name}</Text>
            </View>

            <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 100, paddingTop: 20 }}>
                {subject.topics?.map((topic: any, topicIndex: number) => (
                    <View key={topic.id} className="mb-10 mt-4">
                        {/* Topic Header */}
                        <TouchableOpacity
                            activeOpacity={0.9}
                            onPress={() => {
                                const firstLesson = topic.lessons?.find((l: any) => l.status !== 'LOCKED') || topic.lessons?.[0];
                                if (firstLesson) {
                                    router.push(`/level?id=${firstLesson.id}`);
                                } else {
                                    alert("No lessons available in this unit yet.");
                                }
                            }}
                            className="bg-[#58CC02] mx-4 p-5 rounded-[24px] mb-8 shadow-sm border-b-4 border-[#46A302]"
                        >
                            <Text className="text-white/80 font-black text-base uppercase tracking-wider">Unit {topicIndex + 1}</Text>
                            <Text className="text-white font-bold text-xl mt-1">{topic.name}</Text>
                        </TouchableOpacity>

                        {/* Pathway Nodes */}
                        <View className="items-center relative">
                            {topic.lessons?.map((lesson: any, index: number) => {
                                // Zigzag calculation: 0, 40, 0, -40
                                const offset = index % 4 === 0 ? 0 : index % 4 === 1 ? 50 : index % 4 === 2 ? 0 : -50;

                                const isCompleted = lesson.status === 'COMPLETED';
                                const isCurrent = lesson.status === 'CURRENT';
                                const isLocked = lesson.status === 'LOCKED';

                                let bgColorClass = "bg-[#E5E5E5] dark:bg-gray-800";
                                let borderColorClass = "border-[#C9C9C9] dark:border-gray-700";
                                let icon = <Lock size={28} color="#AFAFAF" />;

                                if (isCompleted) {
                                    bgColorClass = "bg-[#FFC800]";
                                    borderColorClass = "border-[#E5B400]";
                                    icon = <CheckCircle2 size={32} color="#FFF" />;
                                } else if (isCurrent) {
                                    bgColorClass = "bg-[#58CC02]";
                                    borderColorClass = "border-[#46A302]";
                                    icon = <Star size={36} color="#FFF" fill="#FFF" />;
                                }

                                return (
                                    <View key={lesson.id} className="mb-6 items-center justify-center relative z-10" style={{ transform: [{ translateX: offset }] }}>
                                        <TouchableOpacity 
                                            activeOpacity={0.8}
                                            disabled={isLocked}
                                            onPress={() => router.push(`/level?id=${lesson.id}`)}
                                        >
                                            {isCurrent && (
                                                <View className="absolute -top-12 left-1/2 ml-[-40px] w-20 bg-white dark:bg-gray-800 rounded-xl py-2 items-center justify-center border-2 border-gray-100 dark:border-gray-700 shadow-sm z-20">
                                                    <Text className="text-[#58CC02] font-black uppercase text-xs">Start!</Text>
                                                </View>
                                            )}

                                            <View className={`w-20 h-20 rounded-full items-center justify-center border-b-8 ${bgColorClass} ${borderColorClass}`}>
                                                {icon}
                                            </View>
                                        </TouchableOpacity>
                                    </View>
                                );
                            })}
                        </View>
                    </View>
                ))}

                {(!subject.topics || subject.topics.length === 0) && (
                    <View className="items-center justify-center mt-20">
                        <Text className="text-gray-400 font-bold">No units available yet.</Text>
                    </View>
                )}
            </ScrollView>
        </SafeAreaView>
    );
}
