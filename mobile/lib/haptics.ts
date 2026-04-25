import { Platform } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useAuthStore } from '../store/authStore';

/**
 * Preference-gated haptics wrapper.
 * Checks `hapticsEnabled` from authStore before firing.
 * Adapted from Skeeme's haptics pattern.
 */
export const haptics = {
    notificationAsync: (type: Haptics.NotificationFeedbackType = Haptics.NotificationFeedbackType.Success) => {
        if (Platform.OS === 'web') return;
        if (!useAuthStore.getState().hapticsEnabled) return;
        Haptics.notificationAsync(type);
    },

    impactAsync: (style: Haptics.ImpactFeedbackStyle = Haptics.ImpactFeedbackStyle.Medium) => {
        if (Platform.OS === 'web') return;
        if (!useAuthStore.getState().hapticsEnabled) return;
        Haptics.impactAsync(style);
    },

    selectionAsync: () => {
        if (Platform.OS === 'web') return;
        if (!useAuthStore.getState().hapticsEnabled) return;
        Haptics.selectionAsync();
    },
};

// Re-export types for convenience
export { NotificationFeedbackType, ImpactFeedbackStyle } from 'expo-haptics';
