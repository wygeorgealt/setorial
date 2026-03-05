import { View, Text, TouchableOpacity, ScrollView, SafeAreaView, Alert, ActivityIndicator } from 'react-native';
import { ChevronLeft, Check, Crown, Shield, Star, Zap } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../store/authStore';
import { subscriptionApi } from '../services/api';
import { useState, useEffect } from 'react';
import * as Linking from 'expo-linking';

// We keep the icons, colors, and features hardcoded, but mapping the price and amount dynamically
const TIER_META: Record<string, any> = {
    FREE: {
        color: '#8B5CF6',
        accent: '#22C55E',
        icon: Zap,
        features: ['Access basic subjects', '5 quizzes per day', 'Global leaderboard'],
    },
    BRONZE: {
        color: '#8B5CF6',
        accent: '#CD7F32',
        icon: Shield,
        features: ['All Free features', 'Unlimited quizzes', 'Priority support'],
    },
    SILVER: {
        color: '#8B5CF6',
        accent: '#94A3B8',
        icon: Star,
        features: ['All Bronze features', 'Monetization eligible', 'Mock exams', 'Badge system'],
    },
    GOLD: {
        color: '#8B5CF6',
        accent: '#EAB308',
        icon: Crown,
        features: ['All Silver features', 'Priority payouts', 'Exclusive content', 'Personal tutor access'],
    },
};

export default function SubscriptionScreen() {
    const router = useRouter();
    const { user, updateUser } = useAuthStore();
    const currentTier = user?.tier || 'FREE';

    const [loading, setLoading] = useState<string | null>(null);
    const [fetchingPricing, setFetchingPricing] = useState(true);
    const [pricingData, setPricingData] = useState<any>(null);

    useEffect(() => {
        fetchPricing();
    }, []);

    const fetchPricing = async () => {
        try {
            // If user has a locked billing country, use it, else default to NG or trigger fallback on backend
            // For now, we simulate by sending 'NG' if it's not set (or we can hit /pricing without it to get fallback)
            const targetCountry = user?.billingCountry || 'NG';
            const res = await subscriptionApi.getPricing(targetCountry);
            setPricingData(res.data);
        } catch (error) {
            console.error('Failed to fetch pricing', error);
        } finally {
            setFetchingPricing(false);
        }
    };

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

    const formatCurrency = (amount: number, currency: string) => {
        // Basic formatter, will default to local currency symbol if known or code
        if (!currency) return `₦${amount}`;
        const formatter = new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currency,
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        });
        return formatter.format(amount);
    };

    // Combine remote pricing with local metadata
    const getMergedTiers = () => {
        const currency = pricingData?.currency || 'NGN';
        return [
            {
                name: 'Free',
                tierId: 'FREE',
                price: `${formatCurrency(0, currency)}/mo`,
                ...TIER_META.FREE,
            },
            {
                name: 'Bronze',
                tierId: 'BRONZE',
                price: pricingData ? `${formatCurrency(pricingData.bronzeMonthly, currency)}/mo` : 'Loading...',
                ...TIER_META.BRONZE,
            },
            {
                name: 'Silver',
                tierId: 'SILVER',
                price: pricingData ? `${formatCurrency(pricingData.silverMonthly, currency)}/mo` : 'Loading...',
                ...TIER_META.SILVER,
            },
            {
                name: 'Gold',
                tierId: 'GOLD',
                price: pricingData ? `${formatCurrency(pricingData.goldMonthly, currency)}/mo` : 'Loading...',
                ...TIER_META.GOLD,
            },
        ];
    };

    const tiers = getMergedTiers();

    return (
        <SafeAreaView className="flex-1 bg-white dark:bg-[#0B0D12]">
            <View className="flex-row items-center justify-between px-5 py-6">
                <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 items-center justify-center">
                    <ChevronLeft size={24} color="#AFAFAF" />
                </TouchableOpacity>
                <Text className="text-black dark:text-white font-bold text-xl">Subscription</Text>
                <View className="w-10" />
            </View>

            {fetchingPricing ? (
                <View className="flex-1 justify-center items-center">
                    <ActivityIndicator size="large" color="#8B5CF6" />
                    <Text className="text-gray-500 mt-4 font-bold">Loading local pricing...</Text>
                </View>
            ) : (
                <ScrollView className="flex-1 px-5" showsVerticalScrollIndicator={false}>
                    <Text className="text-gray-400 text-sm mb-2 text-center">
                        Upgrade your tier to unlock premium features and monetization.
                    </Text>

                    {pricingData && (
                        <View className="bg-slate-100 dark:bg-slate-800 self-center px-4 py-2 rounded-full mb-6">
                            <Text className="text-slate-500 dark:text-slate-400 font-bold text-xs uppercase tracking-widest">
                                Pricing Region: {pricingData.countryName}
                            </Text>
                        </View>
                    )}

                    {tiers.map((tier) => {
                        const isActive = currentTier === tier.tierId;
                        const Icon = tier.icon;
                        const isLoading = loading === tier.name;

                        return (
                            <View
                                key={tier.name}
                                className={`mb-6 p-6 rounded-[32px] border-2 border-b-4 ${isActive ? 'border-black bg-black dark:border-white dark:bg-[#13151A]' : 'border-gray-100 bg-white dark:border-[#272B36] dark:bg-[#1E222B]'}`}
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
                                            <Text className={`font-bold text-xl ${isActive ? 'text-white' : 'text-black dark:text-white'}`}>
                                                {tier.name}
                                            </Text>
                                            <Text className={`font-bold ${isActive ? 'text-gray-400' : 'text-gray-500'}`}>
                                                {tier.price}
                                            </Text>
                                        </View>
                                    </View>
                                    {isActive && (
                                        <View className="bg-white dark:bg-[#272B36] px-3 py-1.5 rounded-full">
                                            <Text className="text-black dark:text-white font-bold text-xs">ACTIVE</Text>
                                        </View>
                                    )}
                                </View>

                                {tier.features.map((feature: string, i: number) => (
                                    <View key={i} className="flex-row items-center mb-2.5">
                                        <Check size={16} color={isActive ? '#FFF' : tier.accent} strokeWidth={3} />
                                        <Text className={`ml-3 font-medium ${isActive ? 'text-gray-300' : 'text-gray-600'}`}>
                                            {feature}
                                        </Text>
                                    </View>
                                ))}

                                {!isActive && tier.name !== 'Free' && (
                                    <TouchableOpacity
                                        activeOpacity={0.8}
                                        onPress={() => handleUpgrade(tier.name)}
                                        disabled={isLoading}
                                        className="mt-4 py-4 rounded-2xl items-center border-b-4 relative overflow-hidden"
                                        style={{
                                            backgroundColor: isLoading ? '#E5E5E5' : tier.accent,
                                            borderColor: isLoading ? '#CECECE' : tier.accent + 'CC',
                                            borderTopColor: isLoading ? '#E5E5E5' : tier.accent,
                                            borderLeftColor: isLoading ? '#E5E5E5' : tier.accent,
                                            borderRightColor: isLoading ? '#E5E5E5' : tier.accent,
                                        }}
                                    >
                                        {isLoading ? (
                                            <ActivityIndicator color="#FFF" />
                                        ) : (
                                            <Text className="text-white font-bold text-[17px] uppercase tracking-wider">Upgrade to {tier.name}</Text>
                                        )}
                                    </TouchableOpacity>
                                )}
                            </View>
                        );
                    })}

                    {/* Payout Info */}
                    <View className="bg-gray-50 dark:bg-[#1E222B] p-6 rounded-[32px] mb-20 border-2 border-gray-100 dark:border-[#272B36] border-b-4">
                        <Text className="text-black dark:text-white font-bold text-lg mb-2">💰 About Payouts</Text>
                        <Text className="text-gray-500 dark:text-gray-400 leading-6">
                            Payouts are aggregated strictly by your country region to ensure economic fairness.
                            Eligible tracking runs on the{' '}
                            <Text className="text-black dark:text-white font-bold">28th of every month</Text>.
                        </Text>
                    </View>
                </ScrollView>
            )}
        </SafeAreaView>
    );
}
