import { View, Text, TouchableOpacity, ScrollView, SafeAreaView, TextInput } from 'react-native';
import { ChevronLeft, Search, MessageCircle, Mail, Phone } from 'lucide-react-native';
import { useRouter } from 'expo-router';

export default function HelpCenterScreen() {
    const router = useRouter();

    return (
        <SafeAreaView className="flex-1 bg-white dark:bg-[#0B0D12]">
            {/* Header */}
            <View className="flex-row items-center justify-between px-5 py-6">
                <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 items-center justify-center">
                    <ChevronLeft size={24} color="#AFAFAF" />
                </TouchableOpacity>
                <Text className="text-black dark:text-white font-bold text-xl">Help Center</Text>
                <View className="w-10" />
            </View>

            <ScrollView className="flex-1 px-5" showsVerticalScrollIndicator={false}>
                {/* Search Bar */}
                <View className="bg-white dark:bg-[#1E222B] flex-row items-center p-5 rounded-2xl mb-10 border-2 border-b-4 border-[#E5E5E5] dark:border-[#272B36]">
                    <Search size={20} color="#CECECE" />
                    <TextInput
                        placeholder="Search for questions..."
                        className="flex-1 ml-3 text-[#4B4B4B] dark:text-white font-bold text-[17px]"
                        placeholderTextColor="#AFAFAF"
                    />
                </View>

                {/* Popular Topics */}
                <Text className="text-black dark:text-white font-bold text-xl mb-6">Popular Topics</Text>
                <FaqItem question="How do I withdraw my earnings?" answer="Withdrawals are processed automatically on the 28th of every month. Ensure your bank details are verified in your profile." />
                <FaqItem question="How do I upgrade my tier?" answer="Go to the Subscription section in your profile to view and upgrade your tier." />
                <FaqItem question="What are points?" answer="Points are rewards for completing quizzes and participating in learning activities. They can be converted to cash if you meet the eligibility criteria." />

                <View className="h-10" />

                {/* Contact Us */}
                <Text className="text-black dark:text-white font-bold text-xl mb-6">Still need help?</Text>
                <View className="flex-row gap-x-4 mb-20">
                    <ContactCard icon={<MessageCircle size={24} color="#AFAFAF" />} label="Live Chat" />
                    <ContactCard icon={<Mail size={24} color="#AFAFAF" />} label="Email Us" />
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

function FaqItem({ question, answer }: { question: string, answer: string }) {
    const [expanded, setExpanded] = useState(false);
    return (
        <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setExpanded(!expanded)}
            className="mb-4 p-5 bg-white dark:bg-[#1E222B] border-2 border-[#E5E5E5] dark:border-[#272B36] border-b-4 rounded-2xl"
        >
            <Text className="text-[#4B4B4B] dark:text-white font-bold text-[17px] mb-2">{question}</Text>
            {expanded && <Text className="text-[#AFAFAF] dark:text-gray-400 font-bold leading-6">{answer}</Text>}
        </TouchableOpacity>
    );
}

function ContactCard({ icon, label }: { icon: any, label: string }) {
    return (
        <TouchableOpacity activeOpacity={0.8} className="flex-1 bg-white dark:bg-[#1E222B] p-6 rounded-2xl items-center justify-center border-2 border-[#E5E5E5] dark:border-[#272B36] border-b-4">
            <View className="w-12 h-12 rounded-xl bg-[#F5F5F5] dark:bg-[#2A2E39] border-2 border-[#E5E5E5] dark:border-[#272B36] items-center justify-center mb-3">
                {icon}
            </View>
            <Text className="text-[#4B4B4B] dark:text-white font-bold text-[15px]">{label}</Text>
        </TouchableOpacity>
    );
}

import { useState } from 'react';
