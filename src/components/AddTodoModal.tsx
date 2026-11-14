import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { COLORS, DEFAULT_TIMES } from '../constants/theme';

interface AddTodoModalProps {
  visible: boolean;
  onClose: () => void;
  onAdd: (todoText: string, time: string) => void;
}

export const AddTodoModal: React.FC<AddTodoModalProps> = ({
  visible,
  onClose,
  onAdd,
}) => {
  const [todoText, setTodoText] = useState('');
  const [selectedTime, setSelectedTime] = useState('12 pm');
  const [customTime, setCustomTime] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAdd = () => {
    if (!todoText.trim()) return;
    setIsSubmitting(true);
    const finalTime = customTime.trim() || selectedTime;
    onAdd(todoText.trim(), finalTime);
    setTodoText('');
    setCustomTime('');
    setIsSubmitting(false);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={onClose}
        />

        <View style={styles.sheet}>
          {/* Header */}
          <View style={styles.sheetHeader}>
            <Text style={styles.sheetTitle}>Нове завдання ODOT</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Feather name="x" size={20} color={COLORS.iconInactive} />
            </TouchableOpacity>
          </View>

          {/* Task Input */}
          <Text style={styles.inputLabel}>Що потрібно зробити?</Text>
          <TextInput
            style={styles.textInput}
            placeholder="Наприклад: Meet Lorence"
            placeholderTextColor={COLORS.textMuted}
            value={todoText}
            onChangeText={setTodoText}
            autoFocus
          />

          {/* Time Selection */}
          <Text style={styles.inputLabel}>Оберіть час:</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.timeScroll}
            contentContainerStyle={styles.timeScrollContent}
          >
            {DEFAULT_TIMES.map((time) => {
              const isSelected = selectedTime === time && !customTime;
              return (
                <TouchableOpacity
                  key={time}
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

          {/* Custom Time Optional */}
          <TextInput
            style={styles.customTimeInput}
            placeholder="Або введіть свій час (напр. 2:30 pm)"
            placeholderTextColor={COLORS.textMuted}
            value={customTime}
            onChangeText={setCustomTime}
          />

          {/* Action Buttons */}
          <View style={styles.actionRow}>
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
              disabled={!todoText.trim() || isSubmitting}
              activeOpacity={0.8}
            >
              <Feather name="plus-circle" size={18} color={COLORS.white} style={{ marginRight: 6 }} />
              <Text style={styles.submitBtnText}>Додати</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
  },
  backdrop: {
    ...StyleSheet.absoluteFill,
  },
  sheet: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 36,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 20,
  },
  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  sheetTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.textDark,
  },
  closeBtn: {
    padding: 6,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: COLORS.listBg,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: COLORS.textBody,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  timeScroll: {
    marginBottom: 12,
  },
  timeScrollContent: {
    paddingVertical: 4,
  },
  timeChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: COLORS.listBg,
    marginRight: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  timeChipSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  timeChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textSubtitle,
  },
  timeChipTextSelected: {
    color: COLORS.white,
  },
  customTimeInput: {
    backgroundColor: COLORS.listBg,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    color: COLORS.textBody,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelBtn: {
    flex: 1,
    backgroundColor: COLORS.listBg,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textMuted,
  },
  submitBtn: {
    flex: 2,
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  submitBtnDisabled: {
    opacity: 0.5,
  },
  submitBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.white,
  },
});
