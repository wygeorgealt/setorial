import { View, Text, TouchableOpacity, SafeAreaView, ActivityIndicator, ScrollView } from "react-native";
import { ChevronLeft, CheckCircle2, XCircle, Trophy, ArrowRight, Home } from "lucide-react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useState, useEffect } from "react";
import { learningApi } from "../services/api";

export default function QuizScreen() {
    const router = useRouter();
    const { id } = useLocalSearchParams();
    const [quiz, setQuiz] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [selectedOption, setSelectedOption] = useState<number | null>(null);
    const [answers, setAnswers] = useState<number[]>([]);
    const [isFinished, setIsFinished] = useState(false);
    const [result, setResult] = useState<any>(null);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (id) {
            fetchQuiz();
        }
    }, [id]);

    const fetchQuiz = async () => {
        try {
            const res = await learningApi.getQuiz(id as string);
            setQuiz(res.data);
        } catch (error) {
            console.error('Failed to fetch quiz:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleOptionSelect = (index: number) => {
        if (selectedOption !== null) return;
        setSelectedOption(index);
    };

    const handleNext = () => {
        if (selectedOption === null) return;

        const newAnswers = [...answers, selectedOption];
        setAnswers(newAnswers);
        setSelectedOption(null);

        if (currentIndex < quiz.questions.length - 1) {
            setCurrentIndex(currentIndex + 1);
        } else {
            submitQuiz(newAnswers);
        }
    };

    const submitQuiz = async (finalAnswers: number[]) => {
        setSubmitting(true);
        try {
            const res = await learningApi.submitQuiz({
                quizId: id,
                answers: finalAnswers
            });
            setResult(res.data);
            setIsFinished(true);
        } catch (error) {
            console.error('Failed to submit quiz:', error);
            alert('Failed to submit quiz. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <View className="flex-1 bg-white items-center justify-center">
                <ActivityIndicator size="large" color="#000" />
            </View>
        );
    }

    if (!quiz) {
        return (
            <View className="flex-1 bg-white items-center justify-center p-5">
                <Text className="text-gray-500 mb-4">Quiz not found</Text>
                <TouchableOpacity onPress={() => router.back()} className="bg-black px-6 py-3 rounded-full">
                    <Text className="text-white font-bold">Go Back</Text>
                </TouchableOpacity>
            </View>
        );
    }

    if (isFinished) {
        return (
            <SafeAreaView className="flex-1 bg-white dark:bg-[#0B0D12] p-5 items-center justify-center">
                <View className="w-24 h-24 bg-green-100 dark:bg-green-900/30 rounded-full items-center justify-center mb-6">
                    <Trophy size={48} color="#20A68A" />
                </View>
                <Text className="text-3xl font-bold text-black dark:text-white mb-2">Quiz Completed!</Text>
                <Text className="text-gray-500 dark:text-gray-400 text-lg mb-8">You scored {result?.score} out of {result?.total}</Text>

                <View className="bg-gray-50 dark:bg-[#1E222B] w-full p-6 rounded-3xl mb-10">
                    <View className="flex-row justify-between mb-4">
                        <Text className="text-gray-500 dark:text-gray-400 font-medium">Points Earned</Text>
                        <Text className="text-black dark:text-white font-bold">+{result?.pointsEarned} pts</Text>
                    </View>
                    <View className="h-[1px] bg-gray-200 dark:bg-[#272B36] mb-4" />
                    <View className="flex-row justify-between">
                        <Text className="text-gray-500 dark:text-gray-400 font-medium">Status</Text>
                        <Text className="text-green-600 dark:text-green-400 font-bold">Passed</Text>
                    </View>
                </View>

                <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() => router.replace('/(tabs)')}
                    className="bg-black dark:bg-[#1CB0F6] w-full p-5 rounded-3xl flex-row items-center justify-center border-b-4 border-gray-800 dark:border-[#1899D6]"
                >
                    <Home size={20} color="#FFF" />
                    <Text className="text-white font-bold text-lg ml-2">Back to Home</Text>
                </TouchableOpacity>
            </SafeAreaView>
        );
    }

    const currentQuestion = quiz.questions[currentIndex];
    const progress = ((currentIndex + 1) / quiz.questions.length) * 100;

    return (
        <SafeAreaView className="flex-1 bg-white dark:bg-[#0B0D12] p-5">
            {/* Header */}
            <View className="flex-row items-center justify-between mb-8">
                <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 items-center justify-center">
                    <XCircle size={28} color="#AFAFAF" />
                </TouchableOpacity>

                {/* Progress Bar */}
                <View className="h-4 bg-[#E5E5E5] dark:bg-[#272B36] rounded-full flex-1 mx-4 overflow-hidden relative">
                    <View
                        style={{ width: `${progress}%` }}
                        className="h-full bg-[#58CC02] rounded-full absolute left-0 top-0"
                    >
                        <View className="absolute top-1 left-2 right-2 h-[4px] bg-white/30 rounded-full" />
                    </View>
                </View>

                {/* Optional Hearts/Lives could go here, for now just placeholder to balance */}
                <View className="w-10 h-10 items-center justify-center">
                    {/* Empty to balance X button */}
                </View>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 20 }}>
                <Text className="text-2xl font-bold text-[#4B4B4B] dark:text-white mb-8 leading-tight">
                    {currentQuestion.text}
                </Text>

                {currentQuestion.options.map((option: string, index: number) => {
                    const isSelected = selectedOption === index;
                    return (
                        <TouchableOpacity
                            key={index}
                            activeOpacity={0.8}
                            onPress={() => handleOptionSelect(index)}
                            className={`flex-row items-center p-4 rounded-2xl mb-4 border-2 border-b-4 ${isSelected
                                ? 'border-[#1899D6] dark:border-[#1CB0F6] bg-[#DDF4FF] dark:bg-[#1CB0F6]/20 border-t-[#1CB0F6] border-x-[#1CB0F6] dark:border-t-[#1CB0F6] dark:border-x-[#1CB0F6]'
                                : 'border-[#E5E5E5] dark:border-[#272B36] bg-white dark:bg-[#1E222B]'
                                }`}
                        >
                            <View className={`w-8 h-8 rounded-full border-2 items-center justify-center mr-4 ${isSelected ? 'border-[#1899D6] dark:border-transparent bg-[#1CB0F6]' : 'border-[#E5E5E5] dark:border-[#272B36]'
                                }`}>
                                {isSelected && <View className="w-3 h-3 bg-white rounded-full" />}
                                {!isSelected && <Text className="text-[#AFAFAF] font-bold text-sm">{index + 1}</Text>}
                            </View>
                            <Text className={`flex-1 font-bold text-[17px] ${isSelected ? 'text-[#1899D6] dark:text-[#1CB0F6]' : 'text-[#4B4B4B] dark:text-white'
                                }`}>
                                {option}
                            </Text>
                        </TouchableOpacity>
                    );
                })}
            </ScrollView>

            {/* Bottom Button */}
            <View className="mt-auto pt-4 pb-2">
                <TouchableOpacity
                    onPress={handleNext}
                    activeOpacity={0.8}
                    disabled={selectedOption === null || submitting}
                    className={`p-4 rounded-2xl items-center flex-row justify-center border-b-4 ${selectedOption === null || submitting
                        ? 'bg-[#E5E5E5] dark:bg-[#272B36] border-[#CECECE] dark:border-[#1E222B]'
                        : 'bg-[#58CC02] border-[#58A700] border-t-[#58CC02] border-x-[#58CC02]'
                        }`}
                >
                    {submitting ? (
                        <ActivityIndicator color="#FFF" />
                    ) : (
                        <Text className={`font-bold text-[17px] uppercase tracking-wider ${selectedOption === null || submitting ? 'text-[#AFAFAF]' : 'text-white'}`}>
                            {currentIndex === quiz.questions.length - 1 ? 'Submit' : 'Check'}
                        </Text>
                    )}
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}
