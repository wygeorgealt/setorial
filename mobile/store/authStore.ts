import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';

interface User {
    id: string;
    email: string;
    name: string;
    role: string;
    tier: 'FREE' | 'BRONZE' | 'SILVER' | 'GOLD';
    isVerified: boolean;
    avatarUrl?: string;
    points: number;
    streak: number;
    badges?: any[];
    billingCountry?: string;
    detectedCountry?: string | null;
    activeSub?: any;
}

interface AuthState {
    user: User | null;
    token: string | null;
    isLoading: boolean;
    setAuth: (user: User, token: string) => Promise<void>;
    updateUser: (user: Partial<User>) => Promise<void>;
    logout: () => Promise<void>;
    checkSession: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
    user: null,
    token: null,
    isLoading: true,

    setAuth: async (user, token) => {
        await SecureStore.setItemAsync('userToken', token);
        await SecureStore.setItemAsync('userData', JSON.stringify(user));
        set({ user, token, isLoading: false });
    },

    updateUser: async (userData) => {
        set((state) => {
            const newUser = state.user ? { ...state.user, ...userData } : null;
            if (newUser) {
                SecureStore.setItemAsync('userData', JSON.stringify(newUser));
            }
            return { user: newUser };
        });
    },

    logout: async () => {
        await SecureStore.deleteItemAsync('userToken');
        await SecureStore.deleteItemAsync('userData');
        set({ user: null, token: null, isLoading: false });
    },

    checkSession: async () => {
        try {
            const token = await SecureStore.getItemAsync('userToken');
            const userData = await SecureStore.getItemAsync('userData');

            if (token && userData) {
                set({ token, user: JSON.parse(userData), isLoading: false });
            } else {
                set({ isLoading: false });
            }
        } catch (e) {
            set({ isLoading: false });
        }
    }
}));
