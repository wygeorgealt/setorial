import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import LottieView from 'lottie-react-native';
import Animated, { FadeInRight } from 'react-native-reanimated';

interface MascotInteractionProps {
    message: string;
    state?: 'happy' | 'sad' | 'thinking' | 'pointing_down' | 'pointing_up' | 'pointing_left' | 'pointing_right';
}

// Local Lottie animations
const MASCOT_ANIMATIONS = {
    happy: require('../assets/animations/happy.json'),
    sad: require('../assets/animations/crying.json'),
    thinking: require('../assets/animations/happy.json'),
    pointing_down: require('../assets/animations/point down.json'),
    pointing_up: require('../assets/animations/point up.json'),
    pointing_left: require('../assets/animations/point left.json'),
    pointing_right: require('../assets/animations/point left.json'),
};

export const MascotInteraction: React.FC<MascotInteractionProps> = ({ message, state = 'happy' }) => {
    const animation = useRef<LottieView>(null);
    const isRight = state === 'pointing_right';

    return (
        <View className="flex-row items-end px-2">
            {/* Mascot Lottie Animation */}
            <View 
                className="w-32 h-32 -mb-2"
                style={{ transform: [{ scaleX: isRight ? -1 : 1 }] }}
            >
                <LottieView
                    ref={animation}
                    autoPlay
                    loop
                    source={MASCOT_ANIMATIONS[state] || MASCOT_ANIMATIONS.happy}
                    style={{ width: '100%', height: '100%' }}
                />
            </View>

            {/* Speech Bubble */}
            <Animated.View 
                entering={FadeInRight.delay(300)}
                className="flex-1 bg-white dark:bg-[#1E222B] p-4 rounded-[20px] rounded-bl-none border-2 border-b-4 border-gray-100 dark:border-[#272B36] ml-2 mb-8"
            >
                <Text className="text-black dark:text-white font-bold text-[15px] leading-5">
                    {message}
                </Text>
                
                {/* Tail of the bubble */}
                <View 
                    style={styles.bubbleTail}
                    className="absolute -left-[10px] bottom-[-2px] w-0 h-0 border-l-[10px] border-l-transparent border-t-[10px] border-t-white dark:border-t-[#1E222B]"
                />
            </Animated.View>
        </View>
    );
};

const styles = StyleSheet.create({
    bubbleTail: {
        borderRightWidth: 10,
        borderRightColor: 'transparent',
    }
});
