import React from 'react';
import { TouchableOpacity, TouchableOpacityProps } from 'react-native';
import { playSound } from '../lib/audio';

export interface SoundButtonProps extends TouchableOpacityProps {
    soundType?: 'tap' | 'pop' | 'boop';
}

export const SoundButton: React.FC<SoundButtonProps> = ({ 
    soundType = 'tap', 
    onPress, 
    ...props 
}) => {
    const handlePress = (e: any) => {
        playSound(soundType);
        if (onPress) {
            onPress(e);
        }
    };

    return (
        <TouchableOpacity
            activeOpacity={props.activeOpacity ?? 0.7}
            onPress={handlePress}
            {...props}
        />
    );
};
