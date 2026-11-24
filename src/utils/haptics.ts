import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

export function triggerHaptic(style: Haptics.ImpactFeedbackStyle = Haptics.ImpactFeedbackStyle.Light): void {
  if (Platform.OS !== 'web') {
    try {
      Haptics.impactAsync(style);
    } catch {
      // Graceful fallback on devices without haptic engine
    }
  }
}

export function triggerNotificationHaptic(type: Haptics.NotificationFeedbackType = Haptics.NotificationFeedbackType.Success): void {
  if (Platform.OS !== 'web') {
    try {
      Haptics.notificationAsync(type);
    } catch {
      // Graceful fallback
    }
  }
}

export function triggerSelectionHaptic(): void {
  if (Platform.OS !== 'web') {
    try {
      Haptics.selectionAsync();
    } catch {
      // Graceful fallback
    }
  }
}
