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
            <SafeAreaView className="flex-1 bg-white p-5 items-center justify-center">
                <View className="w-24 h-24 bg-green-100 rounded-full items-center justify-center mb-6">
                    <Trophy size={48} color="#20A68A" />
                </View>
                <Text className="text-3xl font-bold text-black mb-2">Quiz Completed!</Text>
                <Text className="text-gray-500 text-lg mb-8">You scored {result?.score} out of {result?.total}</Text>

                <View className="bg-gray-50 w-full p-6 rounded-3xl mb-10">
                    <View className="flex-row justify-between mb-4">
                        <Text className="text-gray-500 font-medium">Points Earned</Text>
                        <Text className="text-black font-bold">+{result?.pointsEarned} pts</Text>
                    </View>
                    <View className="h-[1px] bg-gray-200 mb-4" />
                    <View className="flex-row justify-between">
                        <Text className="text-gray-500 font-medium">Status</Text>
                        <Text className="text-green-600 font-bold">Passed</Text>
                    </View>
                </View>

                <TouchableOpacity
                    onPress={() => router.replace('/(tabs)')}
                    className="bg-black w-full p-5 rounded-3xl flex-row items-center justify-center"
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
        <SafeAreaView className="flex-1 bg-white p-5">
            {/* Header */}
            <View className="flex-row items-center justify-between mb-8">
                <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 items-center justify-center">
                    <ChevronLeft size={24} color="#000" />
                </TouchableOpacity>
                <Text className="text-black font-bold text-lg">Quiz</Text>
                <View className="w-10" />
            </View>

            {/* Progress Bar */}
            <View className="h-2 bg-gray-100 rounded-full mb-10 overflow-hidden">
                <View
                    style={{ width: `${progress}%` }}
                    className="h-full bg-black rounded-full"
                />
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
                <Text className="text-gray-400 font-bold mb-2 uppercase tracking-widest text-xs">
                    Question {currentIndex + 1} of {quiz.questions.length}
                </Text>
                <Text className="text-2xl font-bold text-black mb-10 leading-tight">
                    {currentQuestion.text}
                </Text>

                {currentQuestion.options.map((option: string, index: number) => {
                    const isSelected = selectedOption === index;
                    return (
                        <TouchableOpacity
                            key={index}
                            onPress={() => handleOptionSelect(index)}
                            className={`flex-row items-center p-5 rounded-3xl mb-4 border-2 ${isSelected ? 'border-black bg-black/5' : 'border-gray-100'
                                }`}
                        >
                            <View className={`w-6 h-6 rounded-full border-2 items-center justify-center mr-4 ${isSelected ? 'border-black bg-black' : 'border-gray-300'
                                }`}>
                                {isSelected && <View className="w-2 h-2 bg-white rounded-full" />}
                            </View>
                            <Text className={`flex-1 font-bold text-lg ${isSelected ? 'text-black' : 'text-gray-500'
                                }`}>
                                {option}
                            </Text>
                        </TouchableOpacity>
                    );
                })}
            </ScrollView>

            {/* Bottom Button */}
            <View className="mt-auto pt-5">
                <TouchableOpacity
                    onPress={handleNext}
                    disabled={selectedOption === null || submitting}
                    className={`p-5 rounded-3xl items-center flex-row justify-center ${selectedOption === null || submitting ? 'bg-gray-200' : 'bg-black'
                        }`}
                >
                    {submitting ? (
                        <ActivityIndicator color="#FFF" />
                    ) : (
                        <>
                            <Text className="text-white font-bold text-lg mr-2">
                                {currentIndex === quiz.questions.length - 1 ? 'Submit Quiz' : 'Next Question'}
                            </Text>
                            <ArrowRight size={20} color="#FFF" />
                        </>
                    )}
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}
