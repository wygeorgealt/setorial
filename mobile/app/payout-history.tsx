import { SoundButton } from '../components/SoundButton';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, Info, CalendarClock } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useState, useEffect } from 'react';
import { walletApi } from '../services/api';

export default function PayoutHistoryScreen() {
    const router = useRouter();
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTxs = async () => {
            try {
                const res = await walletApi.getTransactions();
                // Filter only PAYOUT types
                const payouts = res.data.filter((tx: any) => tx.type === 'PAYOUT');
                setTransactions(payouts);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchTxs();
    }, []);

    return (
        <SafeAreaView className="flex-1 bg-white dark:bg-[#0B0D12]">
            <View className="flex-row items-center justify-between px-5 py-6">
                <SoundButton onPress={() => router.back()} className="w-10 h-10 items-center justify-center">
                    <ChevronLeft size={24} color="#AFAFAF" />
                </SoundButton>
                <Text className="text-black dark:text-white font-bold text-xl">Payout History</Text>
                <View className="w-10" />
            </View>

            <ScrollView className="flex-1 px-5 pt-4 pb-20">
                <View className="bg-blue-50 dark:bg-blue-900/20 p-5 rounded-2xl border-2 border-blue-200 dark:border-blue-800/30 mb-8 flex-row items-start">
                    <Info size={24} color="#1CB0F6" className="mt-1" />
                    <View className="ml-3 flex-1">
                        <Text className="text-blue-900 dark:text-blue-300 font-bold mb-1">Automated Payouts Only</Text>
                        <Text className="text-blue-800 dark:text-blue-400 font-medium leading-5">
                            No manual withdrawal requests allowed. Eligible balances are calculated and automatically paid out to your verified account on the 28th of every month.
                        </Text>
                    </View>
                </View>

                {loading ? (
                    <ActivityIndicator size="large" color="#F59E0B" className="mt-10" />
                ) : transactions.length > 0 ? (
                    transactions.map((tx: any) => (
                        <View key={tx.id} className="flex-row justify-between items-center bg-gray-50 dark:bg-[#1E222B] p-5 rounded-2xl border-2 border-gray-200 dark:border-[#272B36] mb-4 border-b-4">
                            <View className="flex-row items-center">
                                <View className="w-12 h-12 rounded-xl bg-white dark:bg-[#2A2E39] items-center justify-center border-2 border-gray-200 dark:border-[#272B36] mr-4">
                                    <CalendarClock size={24} color="#1CB0F6" />
                                </View>
                                <View>
                                    <Text className="text-black dark:text-white font-bold text-[15px]">Automated Transfer</Text>
                                    <View className="flex-row items-center mt-1">
                                        <Text className="text-gray-500 dark:text-gray-400 font-bold text-xs">
                                            {new Date(tx.createdAt).toLocaleDateString()}
                                        </Text>
                                        <Text className="text-gray-300 dark:text-gray-600 mx-2">•</Text>
                                        <Text className="text-blue-500 dark:text-blue-400 font-bold text-xs uppercase">
                                            Rate: ₦{tx.exchangeRate || 1600}
                                        </Text>
                                    </View>
                                </View>
                            </View>
                            <View className="items-end">
                                <Text className="text-black dark:text-white font-bold text-[17px]">
                                    ₦{Math.abs(tx.amount).toLocaleString()}
                                </Text>
                                <Text className="text-gray-400 dark:text-gray-500 text-[11px] font-bold mt-1">
                                    ≈ ${(Math.abs(tx.amount) / (tx.exchangeRate || 1600)).toFixed(2)}
                                </Text>
                            </View>
                        </View>
                    ))
                ) : (
                    <Text className="text-[#AFAFAF] font-bold text-center mt-10">No payout history yet.</Text>
                )}
            </ScrollView>
        </SafeAreaView>
    );
}
