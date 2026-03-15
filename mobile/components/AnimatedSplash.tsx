import React, { useEffect, useRef } from 'react';
import { View, Animated, Image, useColorScheme, Dimensions, Easing } from 'react-native';

const { width } = Dimensions.get('window');

interface AnimatedSplashProps {
    onFinish: () => void;
}

export default function AnimatedSplash({ onFinish }: AnimatedSplashProps) {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';

    // Background
    const bgOpacity = useRef(new Animated.Value(1)).current;

    // Logo animation
    const logoScale = useRef(new Animated.Value(0.1)).current;
    const logoOpacity = useRef(new Animated.Value(0)).current;
    const logoRotate = useRef(new Animated.Value(0)).current;

    // Pulse glow ring
    const pulseScale = useRef(new Animated.Value(0.6)).current;
    const pulseOpacity = useRef(new Animated.Value(0)).current;

    // Second pulse (delayed)
    const pulse2Scale = useRef(new Animated.Value(0.6)).current;
    const pulse2Opacity = useRef(new Animated.Value(0)).current;

    // Tagline
    const tagOpacity = useRef(new Animated.Value(0)).current;
    const tagY = useRef(new Animated.Value(30)).current;

    // Progress bar
    const progressWidth = useRef(new Animated.Value(0)).current;

    // Master
    const masterOpacity = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        // === PHASE 1 (0ms): Logo flies in with a dramatic spring bounce ===
        Animated.parallel([
            Animated.timing(logoOpacity, {
                toValue: 1,
                duration: 400,
                useNativeDriver: true,
            }),
            Animated.spring(logoScale, {
                toValue: 1.15, // Overshoot slightly
                tension: 25,
                friction: 5,
                useNativeDriver: true,
            }),
            // Subtle rotation snap
            Animated.sequence([
                Animated.timing(logoRotate, {
                    toValue: -0.05,
                    duration: 200,
                    useNativeDriver: true,
                }),
                Animated.spring(logoRotate, {
                    toValue: 0,
                    tension: 80,
                    friction: 4,
                    useNativeDriver: true,
                }),
            ]),
        ]).start();

        // === PHASE 2 (600ms): Logo settles to final size ===
        setTimeout(() => {
            Animated.spring(logoScale, {
                toValue: 1,
                tension: 80,
                friction: 8,
                useNativeDriver: true,
            }).start();
        }, 600);

        // === PHASE 3 (700ms): First pulse ring radiates outward ===
        setTimeout(() => {
            Animated.parallel([
                Animated.timing(pulseOpacity, {
                    toValue: 0.5,
                    duration: 200,
                    useNativeDriver: true,
                }),
                Animated.timing(pulseScale, {
                    toValue: 2,
                    duration: 800,
                    easing: Easing.out(Easing.ease),
                    useNativeDriver: true,
                }),
                Animated.timing(pulseOpacity, {
                    toValue: 0,
                    duration: 800,
                    delay: 200,
                    useNativeDriver: true,
                }),
            ]).start();
        }, 700);

        // === PHASE 4 (1000ms): Second pulse ring (staggered) ===
        setTimeout(() => {
            Animated.parallel([
                Animated.timing(pulse2Opacity, {
                    toValue: 0.3,
                    duration: 200,
                    useNativeDriver: true,
                }),
                Animated.timing(pulse2Scale, {
                    toValue: 2.5,
                    duration: 900,
                    easing: Easing.out(Easing.ease),
                    useNativeDriver: true,
                }),
                Animated.timing(pulse2Opacity, {
                    toValue: 0,
                    duration: 900,
                    delay: 200,
                    useNativeDriver: true,
                }),
            ]).start();
        }, 1000);

        // === PHASE 5 (1200ms): Logo does a satisfying little bounce ===
        setTimeout(() => {
            Animated.sequence([
                Animated.timing(logoScale, {
                    toValue: 1.08,
                    duration: 150,
                    useNativeDriver: true,
                }),
                Animated.spring(logoScale, {
                    toValue: 1,
                    tension: 100,
                    friction: 6,
                    useNativeDriver: true,
                }),
            ]).start();
        }, 1200);

        // === PHASE 6 (1400ms): Tagline slides up ===
        setTimeout(() => {
            Animated.parallel([
                Animated.timing(tagOpacity, {
                    toValue: 1,
                    duration: 500,
                    useNativeDriver: true,
                }),
                Animated.spring(tagY, {
                    toValue: 0,
                    tension: 50,
                    friction: 8,
                    useNativeDriver: true,
                }),
            ]).start();
        }, 1400);

        // === Progress bar fills across the bottom (0 to 3500ms) ===
        Animated.timing(progressWidth, {
            toValue: 1,
            duration: 3200,
            easing: Easing.bezier(0.25, 0.1, 0.25, 1),
            useNativeDriver: false, // width can't use native driver
        }).start();

        // === PHASE 7 (3500ms): Exit ===
        const timer = setTimeout(() => {
            Animated.timing(masterOpacity, {
                toValue: 0,
                duration: 400,
                useNativeDriver: true,
            }).start(() => onFinish());
        }, 3500);

        return () => clearTimeout(timer);
    }, []);

    const logoSource = isDark
        ? require('../assets/splash-icon-dark.png')
        : require('../assets/splash-icon.png');

    const spinInterpolation = logoRotate.interpolate({
        inputRange: [-1, 1],
        outputRange: ['-30deg', '30deg'],
    });

    const progressInterpolation = progressWidth.interpolate({
        inputRange: [0, 1],
        outputRange: ['0%', '100%'],
    });

    return (
        <Animated.View
            style={{
                flex: 1,
                backgroundColor: isDark ? '#0B0D12' : '#FFFFFF',
                alignItems: 'center',
                justifyContent: 'center',
                opacity: masterOpacity,
            }}
        >
            {/* Pulse ring 1 */}
            <Animated.View
                style={{
                    position: 'absolute',
                    width: 160,
                    height: 160,
                    borderRadius: 80,
                    borderWidth: 3,
                    borderColor: isDark ? '#1CB0F6' : '#1CB0F6',
                    opacity: pulseOpacity,
                    transform: [{ scale: pulseScale }],
                }}
            />

            {/* Pulse ring 2 */}
            <Animated.View
                style={{
                    position: 'absolute',
                    width: 160,
                    height: 160,
                    borderRadius: 80,
                    borderWidth: 2,
                    borderColor: isDark ? '#58CC02' : '#58CC02',
                    opacity: pulse2Opacity,
                    transform: [{ scale: pulse2Scale }],
                }}
            />

            {/* Main Logo */}
            <Animated.Image
                source={logoSource}
                style={{
                    width: 180,
                    height: 180,
                    resizeMode: 'contain',
                    opacity: logoOpacity,
                    transform: [
                        { scale: logoScale },
                        { rotate: spinInterpolation },
                    ],
                }}
            />

            {/* Tagline */}
            <Animated.Text
                style={{
                    marginTop: 40,
                    color: isDark ? '#555' : '#AFAFAF',
                    fontSize: 15,
                    fontWeight: '800',
                    letterSpacing: 3,
                    textTransform: 'uppercase',
                    opacity: tagOpacity,
                    transform: [{ translateY: tagY }],
                }}
            >
                Learn · Earn · Grow
            </Animated.Text>

            {/* Progress bar at bottom */}
            <View
                style={{
                    position: 'absolute',
                    bottom: 60,
                    width: width * 0.5,
                    height: 5,
                    borderRadius: 3,
                    backgroundColor: isDark ? '#1E222B' : '#F0F0F0',
                    overflow: 'hidden',
                }}
            >
                <Animated.View
                    style={{
                        height: '100%',
                        width: progressInterpolation,
                        borderRadius: 3,
                        backgroundColor: '#1CB0F6',
                    }}
                />
            </View>
        </Animated.View>
    );
}
