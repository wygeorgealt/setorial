import { Audio } from 'expo-av';

const SOUNDS = {
  click: 'https://cdn.pixabay.com/audio/2022/03/15/audio_7314271813.mp3', // Soft UI click
  success: 'https://cdn.pixabay.com/audio/2022/03/10/audio_c3e666a7b1.mp3', // Level up / Success
  error: 'https://cdn.pixabay.com/audio/2022/03/10/audio_55a29c6691.mp3', // Subtle error
  correct: 'https://cdn.pixabay.com/audio/2021/08/04/audio_0624a04033.mp3', // Ding for correct
  streak: 'https://cdn.pixabay.com/audio/2022/01/18/audio_d0a13f69d2.mp3', // Fire / streak sound
};

export async function playSound(name: keyof typeof SOUNDS) {
  try {
    const { sound } = await Audio.Sound.createAsync(
      { uri: SOUNDS[name] },
      { shouldPlay: true, volume: 0.5 }
    );
    
    sound.setOnPlaybackStatusUpdate((status) => {
      if (status.isLoaded && status.didJustFinish) {
        sound.unloadAsync();
      }
    });
  } catch (error) {
    console.log('Error playing sound:', error);
  }
}
