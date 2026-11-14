import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Animated,
  TextInput,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { COLORS } from '../constants/theme';

interface AddTodoModalProps {
  visible: boolean;
  onClose: () => void;
  onAdd: (todoText: string, time: string) => void;
}

const QUICK_TIMES = ['12 pm', '1 pm', '3 pm', '4 pm', '5 pm', '6 pm', '9 am', '10 am', '11 am'];

export const AddTodoModal: React.FC<AddTodoModalProps> = ({
  visible,
  onClose,
  onAdd,
}) => {
  const [todoText, setTodoText] = useState('');
  const [selectedTime, setSelectedTime] = useState('12 pm');
  const [customTime, setCustomTime] = useState('');

  const [slideAnim] = useState(() => new Animated.Value(300));
  const [fadeAnim] = useState(() => new Animated.Value(0));

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 220,
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          friction: 8,
          tension: 140,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      slideAnim.setValue(300);
      fadeAnim.setValue(0);
    }
  }, [visible, slideAnim, fadeAnim]);

  const handleAdd = () => {
    if (!todoText.trim()) return;
    const finalTime = customTime.trim() || selectedTime;
    onAdd(todoText.trim(), finalTime);
    setTodoText('');
    setCustomTime('');
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="none"
      transparent
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <Animated.View style={[styles.backdrop, { opacity: fadeAnim }]}>
          <TouchableOpacity
            style={StyleSheet.absoluteFill}
            activeOpacity={1}
            onPress={onClose}
          />
        </Animated.View>

        <Animated.View
          style={[
            styles.sheet,
            { transform: [{ translateY: slideAnim }] },
          ]}
        >
          {/* M3 Expressive Handle Bar */}
          <View style={styles.dragHandle} />

          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>Створити завдання</Text>
              <Text style={styles.subtitle}>Material 3 Expressive</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Feather name="x" size={20} color={COLORS.textMuted} />
            </TouchableOpacity>
          </View>

          {/* Input field */}
          <View style={styles.inputContainer}>
            <Feather name="edit-3" size={18} color={COLORS.primary} style={styles.inputIcon} />
            <TextInput
              style={styles.textInput}
              placeholder="Що потрібно зробити?"
              placeholderTextColor={COLORS.textMuted}
              value={todoText}
              onChangeText={setTodoText}
              autoFocus
            />
          </View>

          {/* Time Picker Chips */}
          <Text style={styles.sectionLabel}>Час виконання</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.chipRow}
            contentContainerStyle={styles.chipRowContent}
          >
            {QUICK_TIMES.map((time) => {
              const isSelected = selectedTime === time && !customTime;
              return (
                <TouchableOpacity
                  key={time}
                  activeOpacity={0.7}
                  style={[
                    styles.timeChip,
                    isSelected && styles.timeChipSelected,
                  ]}
                  onPress={() => {
                    setSelectedTime(time);
                    setCustomTime('');
                  }}
                >
                  <Text
                    style={[
                      styles.timeChipText,
                      isSelected && styles.timeChipTextSelected,
                    ]}
                  >
                    {time}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Custom Time Input */}
          <View style={styles.customTimeContainer}>
            <Feather name="clock" size={16} color={COLORS.textMuted} style={styles.inputIcon} />
            <TextInput
              style={styles.customTimeInput}
              placeholder="Або введіть свій час (напр. 15:00)"
              placeholderTextColor={COLORS.textMuted}
              value={customTime}
              onChangeText={setCustomTime}
            />
          </View>

          {/* Buttons */}
          <View style={styles.actions}>
            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={onClose}
              activeOpacity={0.7}
            >
              <Text style={styles.cancelBtnText}>Скасувати</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.submitBtn,
                !todoText.trim() && styles.submitBtnDisabled,
              ]}
              onPress={handleAdd}
              disabled={!todoText.trim()}
              activeOpacity={0.85}
            >
              <Feather name="plus" size={18} color="#002966" style={{ marginRight: 6 }} />
              <Text style={styles.submitBtnText}>Додати</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
  },
  sheet: {
    backgroundColor: COLORS.surfaceDark,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingHorizontal: 22,
    paddingTop: 12,
    paddingBottom: 36,
    borderWidth: 1.5,
    borderColor: COLORS.border,
  },
  dragHandle: {
    width: 42,
    height: 5,
    borderRadius: 3,
    backgroundColor: COLORS.border,
    alignSelf: 'center',
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.textLight,
    letterSpacing: -0.4,
  },
  subtitle: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.primary,
    marginTop: 2,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.cardDark,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.cardDark,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    paddingHorizontal: 16,
    marginBottom: 18,
    height: 54,
  },
  inputIcon: {
    marginRight: 10,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: COLORS.textLight,
    fontWeight: '600',
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 10,
  },
  chipRow: {
    marginBottom: 14,
  },
  chipRowContent: {
    paddingVertical: 2,
  },
  timeChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 14,
    backgroundColor: COLORS.cardDark,
    marginRight: 8,
    borderWidth: 1.5,
    borderColor: COLORS.border,
  },
  timeChipSelected: {
    backgroundColor: COLORS.primaryContainer,
    borderColor: COLORS.primary,
  },
  timeChipText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textMuted,
  },
  timeChipTextSelected: {
    color: COLORS.onPrimaryContainer,
  },
  customTimeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.cardDark,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 14,
    marginBottom: 24,
    height: 44,
  },
  customTimeInput: {
    flex: 1,
    fontSize: 13,
    color: COLORS.textLight,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelBtn: {
    flex: 1,
    backgroundColor: COLORS.cardDark,
    borderRadius: 20,
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  cancelBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textMuted,
  },
  submitBtn: {
    flex: 2,
    backgroundColor: COLORS.primary,
    borderRadius: 20,
    paddingVertical: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitBtnDisabled: {
    opacity: 0.45,
  },
  submitBtnText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#002966',
  },
});
