import { View, Text, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TrendingUp, Layers, Wallet, ArrowUpRight, ArrowDownLeft, Clock } from 'lucide-react-native';
import { useState, useEffect, useCallback } from 'react';
import { walletApi } from '../../services/api';

export default function StatisticsScreen() {
    const [balance, setBalance] = useState({ ngn: 0, usd: 0 });
    const [transactions, setTransactions] = useState<any[]>([]);
    const [refreshing, setRefreshing] = useState(false);

    const fetchData = async () => {
        try {
            const [balanceRes, txRes] = await Promise.all([
                walletApi.getBalance(),
                walletApi.getTransactions()
            ]);
            setBalance({
                ngn: balanceRes.data.balance,
                usd: balanceRes.data.balance / 1600
            });
            setTransactions(txRes.data);
        } catch (error) {
            console.error('Failed to fetch wallet data:', error);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await fetchData();
        setRefreshing(false);
    }, []);

    return (
        <SafeAreaView className="flex-1 bg-white">
            <ScrollView
                className="flex-1 px-5 pt-4 pb-20"
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
            >
                {/* Header Section */}
                <Text className="text-black text-[28px] font-bold tracking-tight mb-8">Wallet</Text>

                {/* Balance Card */}
                <View className="bg-black p-8 rounded-[40px] mb-10 overflow-hidden relative">
                    {/* Decorative Background */}
                    <View className="absolute top-[-20] right-[-20] w-40 h-40 bg-white/10 rounded-full" />

                    <Text className="text-gray-400 font-medium mb-2">Total Monetizable Balance</Text>
                    <Text className="text-white text-[42px] font-bold tracking-tighter mb-1">
                        ₦{balance.ngn.toLocaleString()}
                    </Text>
                    <Text className="text-gray-400 text-lg mb-8">${balance.usd.toFixed(2)} USD</Text>

                    <View className="flex-row gap-x-4">
                        <TouchableOpacity className="flex-1 bg-white py-4 rounded-3xl items-center justify-center flex-row">
                            <ArrowUpRight size={18} color="#000" strokeWidth={2.5} />
                            <Text className="text-black font-bold ml-2">Withdraw</Text>
                        </TouchableOpacity>
                        <TouchableOpacity className="flex-1 bg-gray-800 py-4 rounded-3xl items-center justify-center flex-row">
                            <Clock size={18} color="#FFF" />
                            <Text className="text-white font-bold ml-2">Notice</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Important Notice */}
                <View className="bg-orange-50 p-5 rounded-3xl mb-10 border border-orange-100">
                    <Text className="text-orange-800 font-bold mb-1">Payout Notice</Text>
                    <Text className="text-orange-700/80 text-[13px] leading-5">
                        Automatic payouts occur on the <Text className="font-bold">28th of every month</Text>. Ensure your Paystack verification is complete.
                    </Text>
                </View>

                {/* Activity */}
                <Text className="text-black font-bold text-xl tracking-tight mb-4">Transaction History</Text>
                {transactions.length > 0 ? (
                    transactions.map((tx) => (
                        <View key={tx.id} className="flex-row items-center justify-between py-4 border-b border-gray-50">
                            <View className="flex-row items-center">
                                <View className={`w-10 h-10 rounded-full items-center justify-center ${tx.amount > 0 ? 'bg-green-100' : 'bg-red-100'
                                    } mr-4`}>
                                    {tx.amount > 0 ? (
                                        <ArrowDownLeft size={18} color="#20A68A" />
                                    ) : (
                                        <ArrowUpRight size={18} color="#EF4444" />
                                    )}
                                </View>
                                <View>
                                    <Text className="text-black font-bold text-[15px]">{tx.type.replace('_', ' ')}</Text>
                                    <Text className="text-gray-400 text-xs">{new Date(tx.createdAt).toLocaleDateString()}</Text>
                                </View>
                            </View>
                            <Text className={`font-bold text-[15px] ${tx.amount > 0 ? 'text-green-600' : 'text-red-600'
                                }`}>
                                {tx.amount > 0 ? '+' : ''}₦{Math.abs(tx.amount).toLocaleString()}
                            </Text>
                        </View>
                    ))
                ) : (
                    <View className="items-center justify-center bg-gray-50 p-10 rounded-[32px] border border-gray-100">
                        <Layers size={32} color="#D1D5DB" className="mb-3" />
                        <Text className="text-gray-400 font-medium text-center">No transactions yet.</Text>
                    </View>
                )}
            </ScrollView>
        </SafeAreaView>
    );
}
