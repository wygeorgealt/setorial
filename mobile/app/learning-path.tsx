import { View, Text, ScrollView, TouchableOpacity, SafeAreaView, ActivityIndicator } from 'react-native';
import { ChevronLeft, BookOpen, CheckCircle2 } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useState, useEffect } from 'react';
import { authApi } from '../services/api';

export default function LearningPathScreen() {
    const router = useRouter();
    const [progress, setProgress] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchProgress();
    }, []);

    const fetchProgress = async () => {
        try {
            const res = await authApi.getProgress();
            setProgress(res.data);
        } catch (error) {
            console.error('Failed to fetch progress:', error);
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

    return (
        <SafeAreaView className="flex-1 bg-white">
            <View className="flex-row items-center justify-between px-5 py-6">
                <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 items-center justify-center">
                    <ChevronLeft size={24} color="#000" />
                </TouchableOpacity>
                <Text className="text-black font-bold text-xl">Learning Path</Text>
                <View className="w-10" />
            </View>

            <ScrollView className="flex-1 px-5" showsVerticalScrollIndicator={false}>
                {progress.map((subject) => (
                    <View key={subject.id} className="mb-6 bg-gray-50 p-6 rounded-[32px] border border-gray-100">
                        <View className="flex-row items-center justify-between mb-4">
                            <View className="flex-row items-center">
                                <View className="w-12 h-12 bg-white rounded-2xl items-center justify-center mr-4 border border-gray-100">
                                    <BookOpen size={22} color="#000" />
                                </View>
                                <View>
                                    <Text className="text-black font-bold text-lg">{subject.name}</Text>
                                    <Text className="text-gray-400 text-sm">{subject.totalTopics} topics · {subject.totalQuizzes} quizzes</Text>
                                </View>
                            </View>
                            <Text className="text-black font-extrabold text-xl">{subject.progress}%</Text>
                        </View>

                        {/* Progress Bar */}
                        <View className="h-3 bg-gray-200 rounded-full overflow-hidden">
                            <View
                                style={{ width: `${subject.progress}%` }}
                                className="h-full bg-black rounded-full"
                            />
                        </View>

                        <View className="flex-row items-center mt-3">
                            <CheckCircle2 size={14} color="#94A3B8" />
                            <Text className="text-gray-400 text-xs ml-2">
                                {subject.completedQuizzes}/{subject.totalQuizzes} quizzes completed
                            </Text>
                        </View>
                    </View>
                ))}

                {progress.length === 0 && (
                    <View className="items-center justify-center p-10">
                        <BookOpen size={48} color="#D1D5DB" />
                        <Text className="text-gray-400 font-medium mt-4 text-center">Start learning to see your progress here.</Text>
                    </View>
                )}

                <View className="h-20" />
            </ScrollView>
        </SafeAreaView>
    );
}
