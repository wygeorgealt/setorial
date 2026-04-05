import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import Constants from 'expo-constants';
import { authApi } from './api';

export async function registerForPushNotificationsAsync() {
    let token;

    if (Device.isDevice) {
        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;
        if (existingStatus !== 'granted') {
            const { status } = await Notifications.requestPermissionsAsync();
            finalStatus = status;
        }
        if (finalStatus !== 'granted') {
            return;
        }

        try {
            const projectId = Constants.expoConfig?.extra?.eas?.projectId || Constants.easConfig?.projectId;
            if (!projectId) {
                console.warn('Push Notifications disabled: No EAS projectId found in app.json.');
                return undefined;
            }

            token = (await Notifications.getExpoPushTokenAsync({
                projectId,
            })).data;

            if (token) {
                // Ignore API update failures so they don't break the auth flow
                await authApi.updateProfile({ expoPushToken: token }).catch(e => console.warn('Failed to upload push token', e));
            }
        } catch (e: any) {
            console.warn('Failed to get push token:', e.message);
        }
    }

    if (Platform.OS === 'android') {
        Notifications.setNotificationChannelAsync('default', {
            name: 'default',
            importance: Notifications.AndroidImportance.MAX,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: '#FF231F7C',
        });
    }

    return token;
}

Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
        shouldShowBanner: true,
        shouldShowList: true,
    }),
});
