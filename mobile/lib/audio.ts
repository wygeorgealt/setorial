import { Audio, AVPlaybackSource } from 'expo-av';
import { Platform } from 'react-native';
import { useAuthStore } from '../store/authStore';

type SoundName = 'correct' | 'incorrect' | 'victory' | 'complete';

// Sound asset mapping — preloaded on first use
const SOUND_SOURCES: Record<SoundName, AVPlaybackSource> = {
    correct: require('../assets/sounds/correct.mp3'),
    incorrect: require('../assets/sounds/incorrect.mp3'),
    victory: require('../assets/sounds/victory.mp3'),
    complete: require('../assets/sounds/complete.mp3'),
};

// Cache loaded Audio.Sound instances for reuse
const soundCache: Partial<Record<SoundName, Audio.Sound>> = {};

/**
 * Preload all sounds into cache.
 * Call once on app start for instant playback.
 */
export async function preloadSounds(): Promise<void> {
    if (Platform.OS === 'web') return;

    try {
        await Audio.setAudioModeAsync({
            playsInSilentModeIOS: false,
            staysActiveInBackground: false,
            shouldDuckAndroid: true,
        });

        for (const [name, source] of Object.entries(SOUND_SOURCES)) {
            try {
                const { sound } = await Audio.Sound.createAsync(source, { volume: 0.6 });
                soundCache[name as SoundName] = sound;
            } catch (e) {
                if (__DEV__) console.warn(`Failed to preload sound: ${name}`, e);
            }
        }
    } catch (e) {
        if (__DEV__) console.warn('Failed to configure audio mode', e);
    }
}

/**
 * Play a named sound effect.
 * Respects `soundEnabled` preference from authStore.
 */
export async function playSound(name: SoundName): Promise<void> {
    if (Platform.OS === 'web') return;
    if (!useAuthStore.getState().soundEnabled) return;

    try {
        let sound = soundCache[name];

        // Lazy-load if not preloaded
        if (!sound) {
            const source = SOUND_SOURCES[name];
            if (!source) return;
            const { sound: loaded } = await Audio.Sound.createAsync(source, { volume: 0.6 });
            soundCache[name] = loaded;
            sound = loaded;
        }

        // Reset to beginning and play
        await sound.setPositionAsync(0);
        await sound.playAsync();
    } catch (e) {
        if (__DEV__) console.warn(`Failed to play sound: ${name}`, e);
    }
}

/**
 * Cleanup sounds on app unmount.
 */
export async function unloadSounds(): Promise<void> {
    for (const sound of Object.values(soundCache)) {
        try {
            if (sound) await sound.unloadAsync();
        } catch { }
    }
}
