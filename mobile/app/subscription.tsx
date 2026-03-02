import { View, Text, TouchableOpacity, ScrollView, SafeAreaView, Alert, ActivityIndicator } from 'react-native';
import { ChevronLeft, Check, Crown, Shield, Star, Zap } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../store/authStore';
import { subscriptionApi } from '../services/api';
import { useState } from 'react';
import * as Linking from 'expo-linking';

const TIERS = [
    {
        name: 'Free',
        price: '₦0/mo',
        amount: 0,
        color: '#8B5CF6',
        accent: '#22C55E',
        icon: Zap,
        features: ['Access basic subjects', '5 quizzes per day', 'Global leaderboard'],
    },
    {
        name: 'Bronze',
        price: '₦1,000/mo',
        amount: 1000,
        color: '#8B5CF6',
        accent: '#CD7F32',
        icon: Shield,
        features: ['All Free features', 'Unlimited quizzes', 'Priority support'],
    },
    {
        name: 'Silver',
        price: '₦2,000/mo',
        amount: 2000,
        color: '#8B5CF6',
        accent: '#94A3B8',
        icon: Star,
        features: ['All Bronze features', 'Monetization eligible', 'Mock exams', 'Badge system'],
    },
    {
        name: 'Gold',
        price: '₦5,000/mo',
        amount: 5000,
        color: '#8B5CF6',
        accent: '#EAB308',
        icon: Crown,
        features: ['All Silver features', 'Priority payouts', 'Exclusive content', 'Personal tutor access'],
    },
];

export default function SubscriptionScreen() {
    const router = useRouter();
    const { user, updateUser } = useAuthStore();
    const currentTier = user?.tier || 'FREE';
    const [loading, setLoading] = useState<string | null>(null);

    const handleUpgrade = async (tierName: string) => {
        setLoading(tierName);
        try {
            const res = await subscriptionApi.initialize(tierName);
            const { authorization_url, reference } = res.data;

            // Open Paystack checkout page in browser
            await Linking.openURL(authorization_url);

            // After returning, verify the transaction
            setTimeout(async () => {
                try {
                    const verifyRes = await subscriptionApi.verify(reference);
                    if (verifyRes.data.status === 'success') {
                        updateUser({ tier: verifyRes.data.tier });
                        Alert.alert('Success!', `You've been upgraded to ${verifyRes.data.tier} tier!`);
                    }
                } catch (err) {
                    console.log('Verification pending - webhook will handle upgrade');
                }
            }, 3000);
        } catch (error: any) {
            const msg = error.response?.data?.message || 'Failed to initialize payment';
            Alert.alert('Error', msg);
        } finally {
            setLoading(null);
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-white">
            <View className="flex-row items-center justify-between px-5 py-6">
                <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 items-center justify-center">
                    <ChevronLeft size={24} color="#000" />
                </TouchableOpacity>
                <Text className="text-black font-bold text-xl">Subscription</Text>
                <View className="w-10" />
            </View>

            <ScrollView className="flex-1 px-5" showsVerticalScrollIndicator={false}>
                <Text className="text-gray-400 text-sm mb-8 text-center">
                    Upgrade your tier to unlock premium features and monetization.
                </Text>

                {TIERS.map((tier) => {
                    const isActive = currentTier === tier.name.toUpperCase();
                    const Icon = tier.icon;
                    const isLoading = loading === tier.name;

                    return (
                        <View
                            key={tier.name}
                            className={`mb-6 p-6 rounded-[32px] border-2 ${isActive ? 'border-black bg-black' : 'border-gray-100 bg-white'}`}
                        >
                            <View className="flex-row items-center justify-between mb-4">
                                <View className="flex-row items-center">
                                    <View
                                        style={{ backgroundColor: tier.accent + '20' }}
                                        className="w-12 h-12 rounded-2xl items-center justify-center mr-4"
                                    >
                                        <Icon size={24} color={tier.accent} />
                                    </View>
                                    <View>
                                        <Text className={`font-bold text-xl ${isActive ? 'text-white' : 'text-black'}`}>
                                            {tier.name}
                                        </Text>
                                        <Text className={`font-bold ${isActive ? 'text-gray-400' : 'text-gray-500'}`}>
                                            {tier.price}
                                        </Text>
                                    </View>
                                </View>
                                {isActive && (
                                    <View className="bg-white px-3 py-1.5 rounded-full">
                                        <Text className="text-black font-bold text-xs">ACTIVE</Text>
                                    </View>
                                )}
                            </View>

                            {tier.features.map((feature, i) => (
                                <View key={i} className="flex-row items-center mb-2.5">
                                    <Check size={16} color={isActive ? '#FFF' : tier.accent} strokeWidth={3} />
                                    <Text className={`ml-3 font-medium ${isActive ? 'text-gray-300' : 'text-gray-600'}`}>
                                        {feature}
                                    </Text>
                                </View>
                            ))}

                            {!isActive && tier.name !== 'Free' && (
                                <TouchableOpacity
                                    onPress={() => handleUpgrade(tier.name)}
                                    disabled={isLoading}
                                    className="mt-4 py-4 rounded-2xl items-center"
                                    style={{ backgroundColor: isLoading ? '#D1D5DB' : tier.accent }}
                                >
                                    {isLoading ? (
                                        <ActivityIndicator color="#FFF" />
                                    ) : (
                                        <Text className="text-white font-bold text-lg">Upgrade to {tier.name}</Text>
                                    )}
                                </TouchableOpacity>
                            )}
                        </View>
                    );
                })}

                {/* Payout Info */}
                <View className="bg-gray-50 p-6 rounded-[32px] mb-20 border border-gray-100">
                    <Text className="text-black font-bold text-lg mb-2">💰 About Payouts</Text>
                    <Text className="text-gray-500 leading-6">
                        Payouts are processed automatically on the{' '}
                        <Text className="text-black font-bold">28th of every month</Text>.
                        You cannot request manual withdrawals. Eligible Silver & Gold tier users
                        with 12+ months of consistent activity will have their monetizable balance
                        paid out automatically.
                    </Text>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}
