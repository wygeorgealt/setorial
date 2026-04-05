import { View, Text, TouchableOpacity, SafeAreaView, ActivityIndicator, ScrollView, Dimensions } from "react-native";
import { ChevronLeft, CheckCircle2, XCircle, Trophy, ArrowRight, Home, BookOpen } from "lucide-react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useState, useEffect, useCallback } from "react";
import { useColorScheme } from "nativewind";
import { Video, ResizeMode } from 'expo-av';
import Animated, { FadeIn, FadeOut, SlideInDown, useSharedValue, useAnimatedStyle, withSpring, withSequence, withTiming } from 'react-native-reanimated';
import { learningApi } from "../services/api";

const { width } = Dimensions.get('window');

// Lightweight inline markdown renderer
function MarkdownText({ content }: { content: string }) {
    const lines = content.split('\n');
    return (
        <View>
            {lines.map((line, i) => {
                const trimmed = line.trim();
                if (!trimmed) return <View key={i} className="h-3" />;

                if (trimmed.startsWith('### ')) return <Text key={i} className="text-lg font-black text-gray-900 dark:text-white mt-4 mb-1">{trimmed.slice(4)}</Text>;
                if (trimmed.startsWith('## '))  return <Text key={i} className="text-xl font-black text-gray-900 dark:text-white mt-5 mb-1">{trimmed.slice(3)}</Text>;
                if (trimmed.startsWith('# '))   return <Text key={i} className="text-2xl font-black text-gray-900 dark:text-white mt-5 mb-2">{trimmed.slice(2)}</Text>;

                if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
                    return (
                        <View key={i} className="flex-row items-start mb-1.5">
                            <Text className="text-gray-500 dark:text-gray-400 mr-2 mt-0.5 text-base">•</Text>
                            <Text className="text-gray-700 dark:text-gray-200 text-base leading-relaxed flex-1">{parseInline(trimmed.slice(2))}</Text>
                        </View>
                    );
                }

                const numMatch = trimmed.match(/^(\d+)\. (.+)/);
                if (numMatch) {
                    return (
                        <View key={i} className="flex-row items-start mb-1.5">
                            <Text className="text-gray-500 dark:text-gray-400 mr-2 text-base font-bold">{numMatch[1]}.</Text>
                            <Text className="text-gray-700 dark:text-gray-200 text-base leading-relaxed flex-1">{parseInline(numMatch[2])}</Text>
                        </View>
                    );
                }

                return <Text key={i} className="text-gray-700 dark:text-gray-200 text-base leading-relaxed mb-1.5">{parseInline(trimmed)}</Text>;
            })}
        </View>
    );
}

function parseInline(text: string): React.ReactNode[] {
    const parts: React.ReactNode[] = [];
    const regex = /(\*\*(.+?)\*\*|\*(.+?)\*)/g;
    let last = 0;
    let match;
    let idx = 0;
    while ((match = regex.exec(text)) !== null) {
        if (match.index > last) parts.push(<Text key={idx++}>{text.slice(last, match.index)}</Text>);
        if (match[0].startsWith('**')) {
            parts.push(<Text key={idx++} className="font-bold text-gray-900 dark:text-white">{match[2]}</Text>);
        } else {
            parts.push(<Text key={idx++} className="italic text-gray-800 dark:text-gray-100">{match[3]}</Text>);
        }
        last = match.index + match[0].length;
    }
    if (last < text.length) parts.push(<Text key={idx++}>{text.slice(last)}</Text>);
    return parts;
}

export default function LevelScreen() {
    const router = useRouter();
    const { id } = useLocalSearchParams();
    const { colorScheme } = useColorScheme();
    const isDark = colorScheme === 'dark';
    
    const [lesson, setLesson] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [phase, setPhase] = useState<'reading' | 'questions' | 'finished'>('reading');
    const [currentIndex, setCurrentIndex] = useState(0);
    const [selectedOption, setSelectedOption] = useState<number | null>(null);
    const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
    const [showNext, setShowNext] = useState(false);
    const [answers, setAnswers] = useState<number[]>([]);
    const [result, setResult] = useState<any>(null);
    const [submitting, setSubmitting] = useState(false);

    // Animation values
    const checkScale = useSharedValue(1);
    const buttonStyle = useAnimatedStyle(() => ({
        transform: [{ scale: checkScale.value }]
    }));

    useEffect(() => {
        if (id) fetchLesson();
    }, [id]);

    const fetchLesson = async () => {
        try {
            const res = await learningApi.getLesson(id as string);
            setLesson(res.data);
            if (!res.data.content) setPhase('questions');
        } catch (error) {
            console.error('Failed to fetch lesson:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleOptionSelect = (index: number) => {
        if (showNext) return;
        setSelectedOption(index);
        checkScale.value = withSequence(withSpring(1.05), withSpring(1));
    };

    const handleCheck = () => {
        if (selectedOption === null) return;
        const correct = lesson.questions[currentIndex].correctOption === selectedOption;
        setIsCorrect(correct);
        setShowNext(true);
        checkScale.value = withSequence(withSpring(1.1, { damping: 10, stiffness: 200 }), withSpring(1));
    };

    const handleNext = () => {
        const newAnswers = [...answers, selectedOption!];
        setAnswers(newAnswers);
        setSelectedOption(null);
        setIsCorrect(null);
        setShowNext(false);

        if (currentIndex < lesson.questions.length - 1) {
            setCurrentIndex(currentIndex + 1);
        } else {
            submitLesson(newAnswers);
        }
    };

    const submitLesson = async (finalAnswers: number[]) => {
        setSubmitting(true);
        try {
            const res = await learningApi.submitLesson({
                lessonId: id as string,
                answers: finalAnswers
            });
            setResult(res.data);
            setPhase('finished');
        } catch (error) {
            console.error('Failed to submit lesson:', error);
            alert('Failed to submit lesson. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <View className="flex-1 bg-white dark:bg-[#0B0D12] items-center justify-center">
                <ActivityIndicator size="large" color="#58CC02" />
            </View>
        );
    }

    if (!lesson) {
        return (
            <View className="flex-1 bg-white dark:bg-[#0B0D12] items-center justify-center p-5">
                <Text className="text-gray-500 dark:text-gray-400 mb-4">Lesson not found</Text>
                <TouchableOpacity onPress={() => router.back()} className="bg-black px-6 py-3 rounded-full">
                    <Text className="text-white font-bold">Go Back</Text>
                </TouchableOpacity>
            </View>
        );
    }

    if (phase === 'reading') {
        return (
            <SafeAreaView className="flex-1 bg-white dark:bg-[#0B0D12]">
                <View className="flex-row items-center justify-between p-5 border-b-2 border-gray-100 dark:border-gray-800">
                    <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 flex items-center justify-center -ml-2">
                        <XCircle size={28} color="#AFAFAF" />
                    </TouchableOpacity>
                    <Text className="font-bold text-lg text-gray-800 dark:text-white">Learn</Text>
                    <View className="w-10 h-10" />
                </View>

                <ScrollView className="flex-1 px-6 pt-6" showsVerticalScrollIndicator={false}>
                    {lesson.videoUrl && (
                        <View className="mb-6 rounded-2xl overflow-hidden border-2 border-gray-100 dark:border-gray-800 bg-black">
                            <Video
                                source={{ uri: lesson.videoUrl }}
                                rate={1.0}
                                volume={1.0}
                                isMuted={false}
                                resizeMode={ResizeMode.CONTAIN}
                                shouldPlay={false}
                                isLooping={false}
                                useNativeControls
                                style={{ width: '100%', height: 210 }}
                            />
                        </View>
                    )}
                    <View className="w-14 h-14 bg-blue-100 dark:bg-blue-900/30 rounded-2xl items-center justify-center mb-6">
                        <BookOpen size={28} color="#1899D6" />
                    </View>
                    <Text className="text-2xl font-black text-gray-900 dark:text-white mb-6 leading-tight">{lesson.name}</Text>
                    <MarkdownText content={lesson.content || ''} />
                    <View className="h-20" />
                </ScrollView>

                <View className="p-5 border-t-2 border-gray-100 dark:border-gray-800 bg-white dark:bg-[#0B0D12]">
                    <TouchableOpacity
                        activeOpacity={0.8}
                        onPress={() => lesson.questions?.length > 0 ? setPhase('questions') : submitLesson([])}
                        className="bg-[#1CB0F6] p-4 rounded-2xl items-center border-b-4 border-[#1899D6] border-t-[#1CB0F6] border-x-[#1CB0F6]"
                    >
                        <Text className="text-white font-bold text-[17px] uppercase tracking-wider">
                            {lesson.questions?.length > 0 ? 'Start Exercises' : 'Complete Lesson'}
                        </Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    if (phase === 'finished') {
        return (
            <SafeAreaView className="flex-1 bg-white dark:bg-[#0B0D12] p-5 items-center justify-center">
                <Animated.View entering={FadeIn} className="items-center w-full">
                    <View className="w-24 h-24 bg-green-100 dark:bg-green-900/30 rounded-full items-center justify-center mb-6">
                        <Trophy size={48} color="#58CC02" />
                    </View>
                    <Text className="text-3xl font-black text-black dark:text-white mb-2">Lesson Complete!</Text>
                    
                    {lesson.questions?.length > 0 && (
                        <Text className="text-gray-500 dark:text-gray-400 text-lg mb-8 font-medium">You scored {result?.score} out of {result?.total}</Text>
                    )}

                    <View className="bg-gray-50 dark:bg-[#1E222B] w-full p-6 rounded-[24px] mb-10 border-2 border-gray-100 dark:border-gray-800">
                        <View className="flex-row justify-between mb-4 items-center">
                            <Text className="text-gray-500 dark:text-gray-400 font-bold text-[15px] uppercase">XP Earned</Text>
                            <Text className="text-[#FFC800] dark:text-[#FFD900] font-black text-xl">+{result?.pointsEarned} XP</Text>
                        </View>
                        <View className="h-[2px] bg-gray-200 dark:bg-[#272B36] mb-4" />
                        <View className="flex-row justify-between items-center">
                            <Text className="text-gray-500 dark:text-gray-400 font-bold text-[15px] uppercase">Status</Text>
                            <Text className="text-[#58CC02] dark:text-[#58CC02] font-black text-lg">{result?.passed ? 'PASSED' : 'COMPLETED'}</Text>
                        </View>
                    </View>

                    <TouchableOpacity
                        activeOpacity={0.8}
                        onPress={() => router.back()}
                        className="bg-[#58CC02] w-full p-4 rounded-2xl items-center justify-center border-b-4 border-[#46A302] border-t-[#58CC02] border-x-[#58CC02]"
                    >
                        <Text className="text-white font-bold text-[17px] uppercase tracking-wider">Continue</Text>
                    </TouchableOpacity>
                </Animated.View>
            </SafeAreaView>
        );
    }

    const currentQuestion = lesson.questions[currentIndex];
    const progressPercent = ((currentIndex) / lesson.questions.length) * 100;

    return (
        <SafeAreaView className="flex-1 bg-white dark:bg-[#0B0D12]">
            <View className="flex-1 px-5 pt-5 pb-2">
                <View className="flex-row items-center justify-between mb-8">
                    <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 flex items-center justify-center -ml-2">
                        <XCircle size={28} color="#AFAFAF" />
                    </TouchableOpacity>
                    <View className="h-4 bg-[#E5E5E5] dark:bg-[#272B36] rounded-full flex-1 mx-4 overflow-hidden relative">
                        <View
                            style={{ width: `${progressPercent}%` }}
                            className="h-full bg-[#58CC02] rounded-full absolute left-0 top-0 transition-all duration-300 ease-out"
                        >
                            <View className="absolute top-1 left-2 right-2 h-[4px] bg-white dark:bg-zinc-950/30 rounded-full" />
                        </View>
                    </View>
                    <View className="w-10 h-10" />
                </View>

                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
                    <Text className="text-2xl font-black text-[#4B4B4B] dark:text-white mb-8 leading-tight">
                        {currentQuestion.text}
                    </Text>

                    {currentQuestion.options.map((option: string, index: number) => {
                        const isSelected = selectedOption === index;
                        const isWrong = isSelected && isCorrect === false;
                        const isRight = (isSelected && isCorrect === true) || (isCorrect !== null && index === currentQuestion.correctOption);

                        let borderColor = isDark ? '#272B36' : '#E5E5E5';
                        let bgColor = isDark ? '#1E222B' : 'white';
                        let textColor = isDark ? 'white' : '#4B4B4B';
                        let shadowColor = isDark ? '#1E222B' : '#E5E5E5';

                        if (isSelected && isCorrect === null) {
                            borderColor = '#1899D6';
                            bgColor = isDark ? '#1CB0F625' : '#DDF4FF';
                            textColor = '#1899D6';
                            shadowColor = '#1899D6';
                        } else if (isRight) {
                            borderColor = '#58CC02';
                            bgColor = isDark ? '#58CC0225' : '#D7FFB8';
                            textColor = '#58CC02';
                            shadowColor = '#58CC02';
                        } else if (isWrong) {
                            borderColor = '#FF4B4B';
                            bgColor = isDark ? '#FF4B4B25' : '#FFDCDC';
                            textColor = '#FF4B4B';
                            shadowColor = '#FF4B4B';
                        }

                        return (
                            <Animated.View key={index} className="mb-4">
                                <TouchableOpacity
                                    activeOpacity={0.8}
                                    onPress={() => handleOptionSelect(index)}
                                    disabled={showNext}
                                    style={{
                                        borderColor,
                                        backgroundColor: bgColor,
                                        borderBottomWidth: 4,
                                        borderBottomColor: shadowColor
                                    }}
                                    className="flex-row items-center p-5 rounded-2xl border-2"
                                >
                                    <View style={{ borderColor: isSelected || isRight || isWrong ? 'transparent' : (isDark ? '#272B36' : '#E5E5E5'), backgroundColor: isSelected || isRight || isWrong ? textColor : 'transparent' }} className="w-8 h-8 rounded-full border-2 items-center justify-center mr-4">
                                        {(isSelected || isRight || isWrong) ? (
                                            <View className="w-2 h-2 bg-white rounded-full" />
                                        ) : (
                                            <Text className="text-[#AFAFAF] font-bold text-sm">{index + 1}</Text>
                                        )}
                                    </View>
                                    <Text style={{ color: textColor }} className="flex-1 font-bold text-[17px]">
                                        {option}
                                    </Text>
                                </TouchableOpacity>
                            </Animated.View>
                        );
                    })}
                </ScrollView>
            </View>

            <View className={`pt-4 px-5 pb-8 border-t-2 border-gray-100 dark:border-gray-800 ${isCorrect === true ? 'bg-[#D7FFB8] dark:bg-[#1A2E1A]' : isCorrect === false ? 'bg-[#FFDCDC] dark:bg-[#2E1A1A]' : 'bg-white dark:bg-[#0B0D12]'}`}>
                {isCorrect !== null && (
                    <Animated.View entering={SlideInDown} className="mb-6 flex-row items-center">
                        <View className={`w-12 h-12 rounded-full items-center justify-center mr-4 ${isCorrect ? 'bg-[#58CC02]' : 'bg-[#FF4B4B]'}`}>
                            {isCorrect ? <CheckCircle2 size={28} color="white" /> : <XCircle size={28} color="white" />}
                        </View>
                        <View>
                            <Text className={`font-black text-2xl ${isCorrect ? 'text-[#58CC02]' : 'text-[#FF4B4B]'}`}>
                                {isCorrect ? 'Amazing!' : 'Incorrect'}
                            </Text>
                            {!isCorrect && (
                                <Text className="text-[#FF4B4B] font-bold text-sm">
                                    Correct: {currentQuestion.options[currentQuestion.correctOption]}
                                </Text>
                            )}
                        </View>
                    </Animated.View>
                )}

                <Animated.View style={buttonStyle}>
                    <TouchableOpacity
                        onPress={showNext ? handleNext : handleCheck}
                        activeOpacity={0.9}
                        disabled={selectedOption === null || submitting}
                        className={`p-4 rounded-2xl items-center justify-center border-b-4 ${selectedOption === null || submitting
                            ? 'bg-[#E5E5E5] dark:bg-[#272B36] border-[#CECECE] dark:border-[#1E222B]'
                            : isCorrect === true ? 'bg-[#58CC02] border-[#46A302]' : isCorrect === false ? 'bg-[#FF4B4B] border-[#EA2B2B]' : 'bg-[#58CC02] border-[#46A302]'
                            }`}
                    >
                        {submitting ? (
                            <ActivityIndicator color="#FFF" />
                        ) : (
                            <Text className={`font-black text-[17px] uppercase tracking-widest ${selectedOption === null || submitting ? 'text-[#AFAFAF]' : 'text-white'}`}>
                                {showNext ? (currentIndex === lesson.questions.length - 1 ? 'Finish' : 'Continue') : 'Check'}
                            </Text>
                        )}
                    </TouchableOpacity>
                </Animated.View>
            </View>
        </SafeAreaView>
    );
}
