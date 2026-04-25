import React, { useRef, useCallback } from 'react';
import { StyleSheet, Dimensions, Animated, View } from 'react-native';
import { Video, ResizeMode, AVPlaybackStatus } from 'expo-av';

const { width, height } = Dimensions.get('window');

interface AnimatedSplashProps {
    onFinish: () => void;
}

/**
 * Video-based splash screen using splash.mp4.
 * Plays the video once, then calls onFinish to transition to the app.
 */
export default function AnimatedSplash({ onFinish }: AnimatedSplashProps) {
    const videoRef = useRef<Video>(null);
    const opacity = useRef(new Animated.Value(1)).current;

    const onPlaybackStatusUpdate = useCallback((status: AVPlaybackStatus) => {
        if (status.isLoaded && status.didJustFinish) {
            // Video finished playing — fade out smoothly then transition to app
            Animated.timing(opacity, {
                toValue: 0,
                duration: 400, // 400ms fade out
                useNativeDriver: true,
            }).start(() => {
                onFinish();
            });
        }
    }, [onFinish, opacity]);

    return (
        <Animated.View style={[styles.container, { backgroundColor: '#FFFFFF', opacity }]}>
            <Video
                ref={videoRef}
                source={require('../assets/splash.mp4')}
                rate={1.0}
                volume={0}
                isMuted={true}
                resizeMode={ResizeMode.CONTAIN}
                shouldPlay={true}
                isLooping={false}
                onPlaybackStatusUpdate={onPlaybackStatusUpdate}
                style={styles.video}
            />
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    video: {
        width: width,
        height: height,
    },
});
