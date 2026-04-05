import { View, Text, TouchableOpacity, SafeAreaView, ActivityIndicator, ScrollView } from "react-native";
import { ChevronLeft, CheckCircle2, XCircle, Trophy, ArrowRight, Home, BookOpen } from "lucide-react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useState, useEffect } from "react";
import { learningApi } from "../services/api";

// Lightweight inline markdown renderer — no external package needed
function MarkdownText({ content }: { content: string }) {
    const lines = content.split('\n');
    return (
        <View>
            {lines.map((line, i) => {
                const trimmed = line.trim();
                if (!trimmed) return <View key={i} className="h-3" />;

                // Headings
                if (trimmed.startsWith('### ')) return <Text key={i} className="text-lg font-black text-gray-900 dark:text-white mt-4 mb-1">{trimmed.slice(4)}</Text>;
                if (trimmed.startsWith('## '))  return <Text key={i} className="text-xl font-black text-gray-900 dark:text-white mt-5 mb-1">{trimmed.slice(3)}</Text>;
                if (trimmed.startsWith('# '))   return <Text key={i} className="text-2xl font-black text-gray-900 dark:text-white mt-5 mb-2">{trimmed.slice(2)}</Text>;

                // Bullet list
                if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
                    return (
                        <View key={i} className="flex-row items-start mb-1.5">
                            <Text className="text-gray-500 dark:text-gray-400 mr-2 mt-0.5 text-base">•</Text>
                            <Text className="text-gray-700 dark:text-gray-200 text-base leading-relaxed flex-1">{parseInline(trimmed.slice(2))}</Text>
                        </View>
                    );
                }

                // Numbered list
                const numMatch = trimmed.match(/^(\d+)\. (.+)/);
                if (numMatch) {
                    return (
                        <View key={i} className="flex-row items-start mb-1.5">
                            <Text className="text-gray-500 dark:text-gray-400 mr-2 text-base font-bold">{numMatch[1]}.</Text>
                            <Text className="text-gray-700 dark:text-gray-200 text-base leading-relaxed flex-1">{parseInline(numMatch[2])}</Text>
                        </View>
                    );
                }

                // Regular paragraph
                return <Text key={i} className="text-gray-700 dark:text-gray-200 text-base leading-relaxed mb-1.5">{parseInline(trimmed)}</Text>;
            })}
        </View>
    );
}

function parseInline(text: string): React.ReactNode[] {
    // Handle **bold** and *italic*
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
    
    const [lesson, setLesson] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    
    // Phase tracking: 'reading' -> 'questions' -> 'finished'
    const [phase, setPhase] = useState<'reading' | 'questions' | 'finished'>('reading');
    
    const [currentIndex, setCurrentIndex] = useState(0);
    const [selectedOption, setSelectedOption] = useState<number | null>(null);
    const [answers, setAnswers] = useState<number[]>([]);
    const [result, setResult] = useState<any>(null);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (id) {
            fetchLesson();
        }
    }, [id]);

    const fetchLesson = async () => {
        try {
            const res = await learningApi.getLesson(id as string);
            setLesson(res.data);
            if (!res.data.content) {
                setPhase('questions'); // Skip reading if no content
            }
        } catch (error) {
            console.error('Failed to fetch lesson:', error);
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
                lessonId: id,
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
            <View className="flex-1 bg-white dark:bg-zinc-950 items-center justify-center">
                <ActivityIndicator size="large" color="#58CC02" />
            </View>
        );
    }

    if (!lesson) {
        return (
            <View className="flex-1 bg-white dark:bg-zinc-950 items-center justify-center p-5">
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
                    <View className="w-14 h-14 bg-blue-100 dark:bg-blue-900/30 rounded-2xl items-center justify-center mb-6">
                        <BookOpen size={28} color="#1899D6" />
                    </View>
                    <Text className="text-2xl font-black text-gray-900 dark:text-white mb-6 leading-tight">{lesson.name}</Text>
                    
                    <MarkdownText content={lesson.content || ''} />

                    <View className="h-20" />
                </ScrollView>

                {/* Bottom Bar */}
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
            </SafeAreaView>
        );
    }

    const currentQuestion = lesson.questions[currentIndex];
    const progressPercent = ((currentIndex) / lesson.questions.length) * 100;

    return (
        <SafeAreaView className="flex-1 bg-white dark:bg-[#0B0D12] p-5">
            {/* Header */}
            <View className="flex-row items-center justify-between mb-8">
                <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 flex items-center justify-center -ml-2">
                    <XCircle size={28} color="#AFAFAF" />
                </TouchableOpacity>

                {/* Progress Bar */}
                <View className="h-4 bg-[#E5E5E5] dark:bg-[#272B36] rounded-full flex-1 mx-4 overflow-hidden relative">
                    <View
                        style={{ width: `${progressPercent}%` }}
                        className="h-full bg-[#58CC02] rounded-full absolute left-0 top-0 transition-all duration-300 ease-out"
                    >
                        <View className="absolute top-1 left-2 right-2 h-[4px] bg-white dark:bg-zinc-950/30 rounded-full" />
                    </View>
                </View>

                <View className="w-10 h-10 items-center justify-center" />
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
                                {isSelected && <View className="w-3 h-3 bg-white dark:bg-zinc-950 rounded-full" />}
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
            <View className="mt-auto pt-4 pb-2 border-t-2 border-gray-100 dark:border-gray-800 -mx-5 px-5 bg-white dark:bg-[#0B0D12]">
                <TouchableOpacity
                    onPress={handleNext}
                    activeOpacity={0.8}
                    disabled={selectedOption === null || submitting}
                    className={`p-4 rounded-2xl items-center flex-row justify-center border-b-4 ${selectedOption === null || submitting
                        ? 'bg-[#E5E5E5] dark:bg-[#272B36] border-[#CECECE] dark:border-[#1E222B]'
                        : 'bg-[#58CC02] border-[#46A302] border-t-[#58CC02] border-x-[#58CC02]'
                        }`}
                >
                    {submitting ? (
                        <ActivityIndicator color="#FFF" />
                    ) : (
                        <Text className={`font-bold text-[17px] uppercase tracking-wider ${selectedOption === null || submitting ? 'text-[#AFAFAF]' : 'text-white'}`}>
                            {currentIndex === lesson.questions.length - 1 ? 'Check & Finish' : 'Check'}
                        </Text>
                    )}
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

