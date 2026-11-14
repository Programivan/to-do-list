import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { TextInput, Button, IconButton } from 'react-native-paper';
import { COLORS } from '../constants/theme';

interface AddTodoModalProps {
  visible: boolean;
  onClose: () => void;
  onAdd: (todoText: string, time: string) => void;
}

const QUICK_TIMES = ['12 pm', '1 pm', '3 pm', '4 pm', '5 pm', '6 pm', '9 am', '10 am'];

export const AddTodoModal: React.FC<AddTodoModalProps> = ({
  visible,
  onClose,
  onAdd,
}) => {
  const [todoText, setTodoText] = useState('');
  const [selectedTime, setSelectedTime] = useState('12 pm');
  const [customTime, setCustomTime] = useState('');

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
          <View style={styles.dragHandle} />

          <View style={styles.header}>
            <Text style={styles.title}>Нове завдання</Text>
            <IconButton
              icon="close"
              size={20}
              iconColor={COLORS.textMuted}
              onPress={onClose}
            />
          </View>

          <TextInput
            mode="outlined"
            label="Що потрібно зробити?"
            placeholder="Введіть назву завдання"
            value={todoText}
            onChangeText={setTodoText}
            textColor={COLORS.textLight}
            outlineColor={COLORS.border}
            activeOutlineColor={COLORS.primary}
            style={styles.input}
            autoFocus
          />

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

          <TextInput
            mode="outlined"
            label="Або свій час (опціонально)"
            placeholder="наприклад: 14:30"
            value={customTime}
            onChangeText={setCustomTime}
            textColor={COLORS.textLight}
            outlineColor={COLORS.border}
            activeOutlineColor={COLORS.primary}
            style={styles.customTimeInput}
          />

          <View style={styles.actions}>
            <Button
              mode="text"
              textColor={COLORS.textMuted}
              onPress={onClose}
              style={styles.cancelBtn}
            >
              Скасувати
            </Button>
            <Button
              mode="contained"
              icon="plus"
              buttonColor={COLORS.primary}
              textColor="#002D6C"
              onPress={handleAdd}
              disabled={!todoText.trim()}
              style={styles.submitBtn}
            >
              Створити
            </Button>
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
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
  },
  backdrop: {
    ...StyleSheet.absoluteFill,
  },
  sheet: {
    backgroundColor: COLORS.surfaceDark,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 32,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  dragHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.border,
    alignSelf: 'center',
    marginBottom: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.textLight,
  },
  input: {
    backgroundColor: COLORS.cardDark,
    marginBottom: 16,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  chipRow: {
    marginBottom: 12,
  },
  chipRowContent: {
    paddingVertical: 4,
  },
  timeChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: COLORS.cardDark,
    marginRight: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  timeChipSelected: {
    backgroundColor: COLORS.primaryContainer,
    borderColor: COLORS.primary,
  },
  timeChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textMuted,
  },
  timeChipTextSelected: {
    color: COLORS.onPrimaryContainer,
    fontWeight: '700',
  },
  customTimeInput: {
    backgroundColor: COLORS.cardDark,
    marginBottom: 20,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: 12,
  },
  cancelBtn: {
    minWidth: 100,
  },
  submitBtn: {
    minWidth: 130,
    borderRadius: 20,
  },
});
