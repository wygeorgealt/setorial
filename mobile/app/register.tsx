import { View, Text, TextInput, TouchableOpacity, SafeAreaView, KeyboardAvoidingView, Platform, ScrollView } from "react-native";
import { Mail, Lock, User, LogIn, ArrowLeft } from "lucide-react-native";
import { useRouter } from "expo-router";
import { useColorScheme } from "nativewind";
import { useState } from "react";

export default function RegisterScreen() {
    const router = useRouter();
    const { colorScheme } = useColorScheme();
    const isDark = colorScheme === "dark";

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const handleRegister = () => {
        router.replace("/");
    };

    return (
        <SafeAreaView className="flex-1 bg-background-light dark:bg-background-dark">
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                className="flex-1"
            >
                <ScrollView className="flex-1 px-8">
                    <TouchableOpacity onPress={() => router.back()} className="mt-4 mb-8">
                        <ArrowLeft size={24} color={isDark ? "#FFF" : "#000"} />
                    </TouchableOpacity>

                    <View className="mb-10">
                        <Text className="text-3xl font-extrabold text-gray-900 dark:text-white mb-2">Create Account</Text>
                        <Text className="text-gray-500 dark:text-gray-400 font-medium">Join us to start your learning journey.</Text>
                    </View>

                    {/* Form Section */}
                    <View className="space-y-4 mb-8">
                        <View className="relative mb-4">
                            <View className="absolute left-4 top-4 z-10">
                                <User size={20} color={isDark ? "#94A3B8" : "#64748B"} />
                            </View>
                            <TextInput
                                placeholder="Full Name"
                                placeholderTextColor={isDark ? "#475569" : "#94A3B8"}
                                value={name}
                                onChangeText={setName}
                                className="bg-white dark:bg-card-dark p-4 pl-12 rounded-2xl text-gray-900 dark:text-white border border-gray-100 dark:border-gray-800 shadow-sm"
                            />
                        </View>

                        <View className="relative mb-4">
                            <View className="absolute left-4 top-4 z-10">
                                <Mail size={20} color={isDark ? "#94A3B8" : "#64748B"} />
                            </View>
                            <TextInput
                                placeholder="Email Address"
                                placeholderTextColor={isDark ? "#475569" : "#94A3B8"}
                                value={email}
                                onChangeText={setEmail}
                                className="bg-white dark:bg-card-dark p-4 pl-12 rounded-2xl text-gray-900 dark:text-white border border-gray-100 dark:border-gray-800 shadow-sm"
                            />
                        </View>

                        <View className="relative">
                            <View className="absolute left-4 top-4 z-10">
                                <Lock size={20} color={isDark ? "#94A3B8" : "#64748B"} />
                            </View>
                            <TextInput
                                placeholder="Password"
                                placeholderTextColor={isDark ? "#475569" : "#94A3B8"}
                                value={password}
                                onChangeText={setPassword}
                                secureTextEntry
                                className="bg-white dark:bg-card-dark p-4 pl-12 rounded-2xl text-gray-900 dark:text-white border border-gray-100 dark:border-gray-800 shadow-sm"
                            />
                        </View>
                    </View>

                    {/* Register Button */}
                    <TouchableOpacity
                        onPress={handleRegister}
                        className="bg-primary p-5 rounded-2xl items-center shadow-lg shadow-primary/30 mt-4 mb-8"
                    >
                        <Text className="text-white font-bold text-lg">Create Account</Text>
                    </TouchableOpacity>

                    <View className="flex-row justify-center mb-10">
                        <Text className="text-gray-500 dark:text-gray-400">Already have an account? </Text>
                        <TouchableOpacity onPress={() => router.push("/login")}>
                            <Text className="text-primary font-bold">Sign In</Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}
