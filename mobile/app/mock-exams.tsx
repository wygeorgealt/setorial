import { SoundButton } from '../components/SoundButton';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Clock, FileText, Lock } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useState, useEffect } from 'react';
import { mockApi, walletApi } from '../services/api';
import { useAuthStore } from '../store/authStore';

export default function MockExamsScreen() {
    const router = useRouter();
    const { user } = useAuthStore();
    const [mocks, setMocks] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [balance, setBalance] = useState(0);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [mocksRes, walletRes] = await Promise.all([
                mockApi.getAvailable(),
                walletApi.getBalance()
            ]);
            setMocks(mocksRes.data);
            setBalance(walletRes.data.balance);
        } catch (error) {
            console.error('Error fetching mocks', error);
        } finally {
            setLoading(false);
        }
    };

    const handleStartMock = async (mock: any) => {
        Alert.alert(
            "Start Mock Exam",
            `This exam costs ₦${mock.price}. You have ₦${balance}. Are you sure you want to purchase and start? Time starts immediately.`,
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Start Exam",
                    onPress: async () => {
                        try {
                            setLoading(true);
                            const res = await mockApi.start(mock.id);
                            router.push({ pathname: '/active-mock', params: { attemptId: res.data.attemptId, mockId: mock.id } });
                        } catch (error: any) {
                            Alert.alert('Error', error.response?.data?.message || 'Failed to start mock');
                        } finally {
                            setLoading(false);
                        }
                    }
                }
            ]
        );
    };

    return (
        <SafeAreaView className="flex-1 bg-white dark:bg-[#0B0D12]">
            <View className="flex-row items-center px-5 py-4 border-b-2 border-[#E5E5E5] dark:border-[#272B36]">
                <SoundButton onPress={() => router.back()} className="mr-4">
                    <ArrowLeft size={24} color={user?.tier === 'FREE' ? '#000' : '#FFF'} className="dark:text-white" />
                </SoundButton>
                <Text className="text-black dark:text-white text-xl font-bold">Standardized Mocks</Text>
            </View>

            <ScrollView className="flex-1 px-5 pt-6">
                <View className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-2xl border-2 border-blue-200 dark:border-blue-800 mb-6">
                    <Text className="text-blue-800 dark:text-blue-200 font-bold mb-1 tracking-tight text-lg">Wallet Balance: ₦{balance}</Text>
                    <Text className="text-blue-600 dark:text-blue-300 text-sm">Purchase mock tickets to qualify for monetization.</Text>
                </View>

                {loading ? (
                    <ActivityIndicator size="large" color="#F59E0B" className="mt-10" />
                ) : mocks.length > 0 ? (
                    mocks.map((mock) => (
                        <View key={mock.id} className="bg-white dark:bg-[#1E222B] border-2 border-[#E5E5E5] dark:border-[#272B36] border-b-4 rounded-2xl p-5 mb-4">
                            <Text className="text-black dark:text-white font-bold text-xl mb-2">{mock.title}</Text>
                            <Text className="text-gray-500 dark:text-gray-400 mb-4">{mock.description || 'Full standardized examination.'}</Text>

                            <View className="flex-row items-center mb-4">
                                <View className="flex-row items-center mr-4">
                                    <Clock size={16} color="#AFAFAF" />
                                    <Text className="text-gray-500 dark:text-gray-400 font-bold ml-1">{mock.durationMinutes} mins</Text>
                                </View>
                                <View className="flex-row items-center">
                                    <FileText size={16} color="#AFAFAF" />
                                    <Text className="text-gray-500 dark:text-gray-400 font-bold ml-1">{mock._count.questions} qs</Text>
                                </View>
                            </View>

                            <SoundButton
                                onPress={() => handleStartMock(mock)}
                                activeOpacity={0.8}
                                className="bg-[#1CB0F6] flex-row justify-center items-center py-3 rounded-xl border-b-4 border-[#1899D6]"
                            >
                                <Lock size={18} color="#FFF" style={{ marginRight: 6 }} />
                                <Text className="text-white font-bold text-[15px] uppercase tracking-wider">Unlock for ₦{mock.price}</Text>
                            </SoundButton>
                        </View>
                    ))
                ) : (
                    <Text className="text-center text-gray-500 dark:text-gray-400 font-bold mt-10">No active mocks available right now.</Text>
                )}
            </ScrollView>
        </SafeAreaView>
    );
}
