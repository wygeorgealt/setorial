import React from 'react';
import { TouchableOpacity, Animated, Platform } from 'react-native';

interface ScaleButtonProps {
    children: React.ReactNode;
    onPress?: () => void;
    activeOpacity?: number;
    className?: string;
    style?: any;
    disabled?: boolean;
}

export const ScaleButton: React.FC<ScaleButtonProps> = ({ 
    children, 
    onPress, 
    activeOpacity = 0.9, 
    className,
    style,
    disabled
}) => {
    const scaleValue = new Animated.Value(1);

    const onPressIn = () => {
        Animated.spring(scaleValue, {
            toValue: 0.96,
            useNativeDriver: true,
            tension: 40,
            friction: 3
        }).start();
    };

    const onPressOut = () => {
        Animated.spring(scaleValue, {
            toValue: 1,
            useNativeDriver: true,
            tension: 40,
            friction: 3
        }).start();
    };

    return (
        <TouchableOpacity
            activeOpacity={activeOpacity}
            onPress={onPress}
            onPressIn={onPressIn}
            onPressOut={onPressOut}
            className={className}
            disabled={disabled}
            style={[
                style,
                { transform: [{ scale: scaleValue }] }
            ]}
        >
            {children}
        </TouchableOpacity>
    );
};
