import { View, Text, TouchableOpacity, ScrollView, SafeAreaView, TextInput } from 'react-native';
import { ChevronLeft, Search, MessageCircle, Mail, Phone } from 'lucide-react-native';
import { useRouter } from 'expo-router';

export default function HelpCenterScreen() {
    const router = useRouter();

    return (
        <SafeAreaView className="flex-1 bg-white">
            {/* Header */}
            <View className="flex-row items-center justify-between px-5 py-6">
                <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 items-center justify-center">
                    <ChevronLeft size={24} color="#000" />
                </TouchableOpacity>
                <Text className="text-black font-bold text-xl">Help Center</Text>
                <View className="w-10" />
            </View>

            <ScrollView className="flex-1 px-5" showsVerticalScrollIndicator={false}>
                {/* Search Bar */}
                <View className="bg-gray-100 flex-row items-center px-5 py-4 rounded-3xl mb-10">
                    <Search size={20} color="#94A3B8" />
                    <TextInput
                        placeholder="Search for questions..."
                        className="flex-1 ml-3 text-black font-medium"
                        placeholderTextColor="#94A3B8"
                    />
                </View>

                {/* Popular Topics */}
                <Text className="text-black font-bold text-xl mb-6">Popular Topics</Text>
                <FaqItem question="How do I withdraw my earnings?" answer="Withdrawals are processed automatically on the 28th of every month. Ensure your bank details are verified in your profile." />
                <FaqItem question="How do I upgrade my tier?" answer="Go to the Subscription section in your profile to view and upgrade your tier." />
                <FaqItem question="What are points?" answer="Points are rewards for completing quizzes and participating in learning activities. They can be converted to cash if you meet the eligibility criteria." />

                <View className="h-10" />

                {/* Contact Us */}
                <Text className="text-black font-bold text-xl mb-6">Still need help?</Text>
                <View className="flex-row gap-x-4 mb-20">
                    <ContactCard icon={<MessageCircle size={24} color="#000" />} label="Live Chat" />
                    <ContactCard icon={<Mail size={24} color="#000" />} label="Email Us" />
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

function FaqItem({ question, answer }: { question: string, answer: string }) {
    const [expanded, setExpanded] = useState(false);
    return (
        <TouchableOpacity
            onPress={() => setExpanded(!expanded)}
            className="mb-6 pb-6 border-b border-gray-100"
        >
            <Text className="text-black font-bold text-lg mb-2">{question}</Text>
            {expanded && <Text className="text-gray-500 leading-6">{answer}</Text>}
        </TouchableOpacity>
    );
}

function ContactCard({ icon, label }: { icon: any, label: string }) {
    return (
        <TouchableOpacity className="flex-1 bg-gray-50 p-6 rounded-[32px] items-center justify-center border border-gray-100">
            {icon}
            <Text className="text-black font-bold mt-3">{label}</Text>
        </TouchableOpacity>
    );
}

import { useState } from 'react';
