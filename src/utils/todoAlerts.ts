import { Alert } from 'react-native';
import * as Haptics from 'expo-haptics';

import { AppDispatch } from '@/store';
import { clearAllTodos } from '@/store/todoSlice';
import { triggerHaptic, triggerNotificationHaptic } from '@/utils/haptics';

/**
 * Prompts the user before clearing all tasks from the Redux store.
 */
export function confirmClearAllTodos(
  dispatch: AppDispatch,
  totalCount: number
): void {
  if (totalCount === 0) return;
  triggerHaptic(Haptics.ImpactFeedbackStyle.Heavy);
  Alert.alert('Очистити список', 'Видалити всі завдання зі списку?', [
    { text: 'Скасувати', style: 'cancel' },
    {
      text: 'Видалити всі',
      style: 'destructive',
      onPress: () => {
        triggerNotificationHaptic(Haptics.NotificationFeedbackType.Warning);
        dispatch(clearAllTodos());
      },
    },
  ]);
}
