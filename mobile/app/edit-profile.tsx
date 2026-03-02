import { View, Text, TouchableOpacity, SafeAreaView, TextInput, ActivityIndicator, Alert } from 'react-native';
import { ChevronLeft, Camera } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../store/authStore';
import { authApi } from '../services/api';
import { useState } from 'react';

export default function EditProfileScreen() {
    const router = useRouter();
    const { user, updateUser } = useAuthStore();
    const [name, setName] = useState(user?.name || '');
    const [saving, setSaving] = useState(false);

    const handleSave = async () => {
        if (!name.trim()) return;
        setSaving(true);
        try {
            const res = await authApi.updateProfile({ name: name.trim() });
            updateUser({ name: res.data.name });
            Alert.alert('Success', 'Profile updated successfully');
            router.back();
        } catch (error) {
            Alert.alert('Error', 'Failed to update profile');
        } finally {
            setSaving(false);
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-white">
            <View className="flex-row items-center justify-between px-5 py-6">
                <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 items-center justify-center">
                    <ChevronLeft size={24} color="#000" />
                </TouchableOpacity>
                <Text className="text-black font-bold text-xl">Edit Profile</Text>
                <TouchableOpacity onPress={handleSave} disabled={saving}>
                    {saving ? (
                        <ActivityIndicator size="small" color="#000" />
                    ) : (
                        <Text className="text-black font-bold text-lg">Save</Text>
                    )}
                </TouchableOpacity>
            </View>

            <View className="px-5">
                {/* Avatar */}
                <View className="items-center mb-10">
                    <View className="relative">
                        <View className="w-28 h-28 rounded-full bg-gray-100 items-center justify-center border-4 border-white shadow-md">
                            <Text className="text-4xl">{(user?.name || 'S')[0].toUpperCase()}</Text>
                        </View>
                        <TouchableOpacity className="absolute bottom-0 right-0 bg-black w-10 h-10 rounded-full items-center justify-center border-4 border-white">
                            <Camera size={16} color="#FFF" />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Name */}
                <Text className="text-gray-400 font-bold text-xs uppercase tracking-widest mb-2">Full Name</Text>
                <TextInput
                    value={name}
                    onChangeText={setName}
                    className="bg-gray-50 p-5 rounded-2xl text-black font-bold text-lg border border-gray-100 mb-6"
                    placeholder="Your name"
                    placeholderTextColor="#94A3B8"
                />

                {/* Email (read-only) */}
                <Text className="text-gray-400 font-bold text-xs uppercase tracking-widest mb-2">Email</Text>
                <View className="bg-gray-50 p-5 rounded-2xl border border-gray-100 mb-6">
                    <Text className="text-gray-400 font-bold text-lg">{user?.email || ''}</Text>
                </View>

                {/* Tier */}
                <Text className="text-gray-400 font-bold text-xs uppercase tracking-widest mb-2">Current Tier</Text>
                <View className="bg-gray-50 p-5 rounded-2xl border border-gray-100">
                    <Text className="text-black font-bold text-lg">{user?.tier || 'FREE'}</Text>
                </View>
            </View>
        </SafeAreaView>
    );
}
