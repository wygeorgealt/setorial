import { View, Text, TextInput, TouchableOpacity, SafeAreaView, KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator } from "react-native";
import { ArrowLeft, Eye, EyeOff, Check, ChevronDown } from "lucide-react-native";
import { useRouter } from "expo-router";
import { useState } from "react";
import { authApi } from "../services/api";
import { useAuthStore } from "../store/authStore";

export default function RegisterScreen() {
    const router = useRouter();

    // Using light theme natively to match the design
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [agreed, setAgreed] = useState(false);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const setAuth = useAuthStore((state) => state.setAuth);

    const handleRegister = async () => {
        if (!name || !email || !password || !agreed) {
            setError("Please fill all fields and agree to the Privacy Policy");
            return;
        }

        try {
            setLoading(true);
            setError("");

            const response = await authApi.register({ email, password, name });
            await setAuth(response.data.user, response.data.token);
        } catch (err: any) {
            const message = err.response?.data?.message;
            setError(Array.isArray(message) ? message[0] : message || "Registration failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-white">
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                className="flex-1"
            >
                <ScrollView className="flex-1 px-5 pt-4">

                    {/* Header */}
                    <View className="flex-row items-center justify-between mb-8">
                        <TouchableOpacity onPress={() => router.back()} className="p-2 -ml-2">
                            <ArrowLeft size={24} color="#000" strokeWidth={2.5} />
                        </TouchableOpacity>
                        <TouchableOpacity className="flex-row items-center">
                            <Text className="text-black font-bold mr-1">English</Text>
                            <ChevronDown size={18} color="#000" />
                        </TouchableOpacity>
                    </View>

                    {/* Title Area */}
                    <View className="mb-8">
                        <Text className="text-[26px] font-bold text-black mb-1.5 tracking-tight">Create your account</Text>
                        <Text className="text-gray-500 text-base">We'll send you a code to verify this email.</Text>
                    </View>

                    {/* Form Section */}
                    <View className="mb-8">

                        {/* Name Input */}
                        <View className="border border-gray-200 rounded-xl px-4 pt-3 pb-2 mb-4">
                            <Text className="text-gray-400 text-[12px] font-medium mb-0.5 tracking-wide">Full Name</Text>
                            <TextInput
                                placeholder="Your full name"
                                placeholderTextColor="#9CA3AF"
                                value={name}
                                onChangeText={setName}
                                className="text-black text-[16px] font-semibold p-0 m-0 h-6"
                                autoCapitalize="words"
                            />
                        </View>

                        {/* Email Input */}
                        <View className="border border-gray-200 rounded-xl px-4 pt-3 pb-2 mb-4">
                            <Text className="text-gray-400 text-[12px] font-medium mb-0.5 tracking-wide">Email</Text>
                            <TextInput
                                placeholder="name@example.com"
                                placeholderTextColor="#9CA3AF"
                                value={email}
                                onChangeText={setEmail}
                                className="text-black text-[16px] font-semibold p-0 m-0 h-6"
                                keyboardType="email-address"
                                autoCapitalize="none"
                            />
                        </View>

                        {/* Password Input */}
                        <View className="border border-gray-200 rounded-xl px-4 pt-3 pb-2 mb-4 flex-row items-center justify-between">
                            <View className="flex-1">
                                <Text className="text-gray-400 text-[12px] font-medium mb-0.5 tracking-wide">Password</Text>
                                <TextInput
                                    placeholder="••••••••••"
                                    placeholderTextColor="#9CA3AF"
                                    value={password}
                                    onChangeText={setPassword}
                                    secureTextEntry={!showPassword}
                                    className="text-black text-[16px] font-semibold p-0 m-0 h-6"
                                />
                            </View>
                            <TouchableOpacity onPress={() => setShowPassword(!showPassword)} className="p-2 -mr-2">
                                {showPassword ? (
                                    <EyeOff size={20} color="#9CA3AF" />
                                ) : (
                                    <Eye size={20} color="#9CA3AF" />
                                )}
                            </TouchableOpacity>
                        </View>

                        {/* Referral Input (Optional styling) */}
                        <View className="border border-gray-200 rounded-xl px-4 pt-3 pb-2 mb-4 opacity-60 justify-center h-[64px]">
                            <TextInput
                                placeholder="Referral code (optional)"
                                placeholderTextColor="#9CA3AF"
                                className="text-gray-400 text-[16px] font-medium p-0 m-0 h-6"
                                editable={false}
                            />
                        </View>
                    </View>

                    {error ? <Text className="text-red-500 text-sm mb-4">{error}</Text> : null}

                </ScrollView>

                {/* Bottom Action Area */}
                <View className="px-5 pb-8 pt-4 border-t border-transparent">
                    {/* Privacy Policy Checkbox */}
                    <TouchableOpacity
                        className="flex-row items-center mb-6"
                        onPress={() => setAgreed(!agreed)}
                    >
                        <View className={`w-6 h-6 rounded border mr-3 items-center justify-center ${agreed ? 'bg-black border-black' : 'border-gray-300 bg-white'}`}>
                            {agreed && <Check size={16} color="#FFF" strokeWidth={3} />}
                        </View>
                        <Text className="text-black text-base">
                            I agree to Setorial's <Text className="font-bold">Privacy Policy</Text>
                        </Text>
                    </TouchableOpacity>

                    {/* Continue Button */}
                    <TouchableOpacity
                        activeOpacity={0.8}
                        onPress={handleRegister}
                        disabled={loading || !agreed}
                        className={`py-4 rounded-2xl items-center border-b-4 ${loading || !agreed
                            ? 'bg-[#E5E5E5] border-[#CECECE]'
                            : 'bg-[#58CC02] border-[#58A700] border-t-[#58CC02] border-x-[#58CC02]'
                            }`}
                    >
                        {loading ? (
                            <ActivityIndicator color="#FFF" />
                        ) : (
                            <Text className={`font-bold text-[17px] uppercase tracking-wider ${loading || !agreed ? 'text-[#AFAFAF]' : 'text-white'}`}>Continue</Text>
                        )}
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}
