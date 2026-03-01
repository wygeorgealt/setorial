import { View, Text, TextInput, TouchableOpacity, SafeAreaView, KeyboardAvoidingView, Platform, Image } from "react-native";
import { Mail, Lock, LogIn, Github } from "lucide-react-native";
import { Link, useRouter } from "expo-router";
import { useColorScheme } from "nativewind";
import { useState } from "react";

export default function LoginScreen() {
    const router = useRouter();
    const { colorScheme } = useColorScheme();
    const isDark = colorScheme === "dark";

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const handleLogin = () => {
        // We will implement actual login logic later
        router.replace("/");
    };

    return (
        <SafeAreaView className="flex-1 bg-background-light dark:bg-background-dark">
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                className="flex-1"
            >
                <View className="flex-1 px-8 justify-center">
                    {/* Logo / Branding Section */}
                    <View className="items-center mb-12">
                        <View className="w-24 h-24 bg-primary rounded-[32px] items-center justify-center shadow-2xl shadow-primary/40 rotate-12 mb-6">
                            <LogIn size={40} color="#FFF" />
                        </View>
                        <Text className="text-3xl font-extrabold text-gray-900 dark:text-white mb-2">SETORIAL</Text>
                        <Text className="text-gray-500 dark:text-gray-400 font-medium">Master your sector, master your future.</Text>
                    </View>

                    {/* Form Section */}
                    <View className="space-y-4 mb-8">
                        <View className="relative">
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

                        <View className="relative mt-4">
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

                        <TouchableOpacity className="items-end mt-2">
                            <Text className="text-primary font-bold">Forgot Password?</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Login Button */}
                    <TouchableOpacity
                        onPress={handleLogin}
                        className="bg-primary p-5 rounded-2xl items-center shadow-lg shadow-primary/30 mb-6"
                    >
                        <Text className="text-white font-bold text-lg">Sign In</Text>
                    </TouchableOpacity>

                    {/* Divider */}
                    <View className="flex-row items-center mb-8">
                        <View className="flex-1 h-[1px] bg-gray-200 dark:bg-gray-800" />
                        <Text className="mx-4 text-gray-400 font-medium">Or continue with</Text>
                        <View className="flex-1 h-[1px] bg-gray-200 dark:bg-gray-800" />
                    </View>

                    {/* Social Login */}
                    <View className="flex-row space-x-4">
                        <TouchableOpacity className="flex-1 flex-row items-center justify-center bg-white dark:bg-card-dark p-4 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
                            <Github size={20} color={isDark ? "#FFF" : "#000"} />
                            <Text className="text-gray-900 dark:text-white font-bold ml-2">GitHub</Text>
                        </TouchableOpacity>
                    </View>

                    <View className="flex-row justify-center mt-10">
                        <Text className="text-gray-500 dark:text-gray-400">Don't have an account? </Text>
                        <Link href="/register" asChild>
                            <TouchableOpacity>
                                <Text className="text-primary font-bold">Sign Up</Text>
                            </TouchableOpacity>
                        </Link>
                    </View>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}
