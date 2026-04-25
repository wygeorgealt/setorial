import { haptics, NotificationFeedbackType, ImpactFeedbackStyle } from './haptics';
import { playSound } from './audio';

/**
 * Unified feedback orchestrator — combines haptics + audio for game-like events.
 * Inspired by Duolingo's feedback patterns.
 *
 * Usage:
 *   feedback.correctAnswer()   — on correct MCQ selection
 *   feedback.wrongAnswer()     — on incorrect MCQ selection
 *   feedback.victory()         — quiz/mock passed
 *   feedback.tryAgain()        — quiz/mock failed
 *   feedback.optionSelect()    — tapping an option (haptic only)
 */
export const feedback = {
    /** Correct answer — bright chime + success haptic */
    correctAnswer: () => {
        haptics.notificationAsync(NotificationFeedbackType.Success);
        playSound('correct');
    },

    /** Wrong answer — soft buzz + error haptic */
    wrongAnswer: () => {
        haptics.notificationAsync(NotificationFeedbackType.Error);
        playSound('incorrect');
    },

    /** Quiz/Mock passed — fanfare + success haptic */
    victory: () => {
        haptics.notificationAsync(NotificationFeedbackType.Success);
        playSound('victory');
    },

    /** Quiz/Mock failed — neutral ding + medium impact */
    tryAgain: () => {
        haptics.impactAsync(ImpactFeedbackStyle.Medium);
        playSound('complete');
    },

    /** Tapping an option — selection haptic only (no sound, too frequent) */
    optionSelect: () => {
        haptics.selectionAsync();
    },

    /** Anti-cheat warning — warning haptic only */
    warning: () => {
        haptics.notificationAsync(NotificationFeedbackType.Warning);
    },
};
