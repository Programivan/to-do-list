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
import { useForm, Controller } from 'react-hook-form';
import { Feather } from '@expo/vector-icons';
import { Priority, TodoFormData } from '../types/todo';
import { COLORS } from '../constants/theme';

interface AddTodoModalProps {
  visible: boolean;
  onClose: () => void;
  onAdd: (data: TodoFormData) => void;
}

function getTodayString(): string {
  const d = new Date();
  const day = d.getDate();
  const months = [
    'Січ', 'Лют', 'Бер', 'Кві', 'Тра', 'Чер',
    'Лип', 'Сер', 'Вер', 'Жов', 'Лис', 'Гру',
  ];
  return `${day} ${months[d.getMonth()]}`;
}

function getTomorrowString(): string {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  const day = d.getDate();
  const months = [
    'Січ', 'Лют', 'Бер', 'Кві', 'Тра', 'Чер',
    'Лип', 'Сер', 'Вер', 'Жов', 'Лис', 'Гру',
  ];
  return `${day} ${months[d.getMonth()]}`;
}

const PRIORITIES: { key: Priority; label: string; icon: string; bg: string; border: string; text: string }[] = [
  {
    key: 'high',
    label: 'Високий (High)',
    icon: 'alert-triangle',
    bg: COLORS.priorityHighBg,
    border: COLORS.priorityHighBorder,
    text: COLORS.priorityHighText,
  },
  {
    key: 'medium',
    label: 'Середній (Med)',
    icon: 'clock',
    bg: COLORS.priorityMedBg,
    border: COLORS.priorityMedBorder,
    text: COLORS.priorityMedText,
  },
  {
    key: 'low',
    label: 'Низький (Low)',
    icon: 'arrow-down',
    bg: COLORS.priorityLowBg,
    border: COLORS.priorityLowBorder,
    text: COLORS.priorityLowText,
  },
];

export const AddTodoModal: React.FC<AddTodoModalProps> = ({
  visible,
  onClose,
  onAdd,
}) => {
  const [slideAnim] = useState(() => new Animated.Value(400));
  const [fadeAnim] = useState(() => new Animated.Value(0));

  // React Hook Form initialization
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<TodoFormData>({
    defaultValues: {
      title: '',
      date: getTodayString(),
      priority: 'medium',
    },
    mode: 'onChange',
  });

  useEffect(() => {
    if (visible) {
      reset({
        title: '',
        date: getTodayString(),
        priority: 'medium',
      });
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
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
      slideAnim.setValue(400);
      fadeAnim.setValue(0);
    }
  }, [visible, slideAnim, fadeAnim, reset]);

  const onSubmit = (data: TodoFormData) => {
    onAdd(data);
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
          {/* Drag Handle */}
          <View style={styles.dragHandle} />

          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>Нове завдання</Text>
              <Text style={styles.subtitle}>React Hook Form • Material 3</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Feather name="x" size={20} color={COLORS.textMuted} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* 1. ПОЛЕ: НАЗВА */}
            <Text style={styles.label}>Назва завдання *</Text>
            <Controller
              control={control}
              name="title"
              rules={{
                required: 'Назва завдання є обовʼязковою',
                minLength: {
                  value: 3,
                  message: 'Мінімальна довжина — 3 символи',
                },
              }}
              render={({ field: { onChange, onBlur, value } }) => (
                <View
                  style={[
                    styles.inputContainer,
                    errors.title && styles.inputErrorBorder,
                  ]}
                >
                  <Feather
                    name="edit-3"
                    size={18}
                    color={errors.title ? COLORS.danger : COLORS.primary}
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.textInput}
                    placeholder="Наприклад: Підготувати звіт"
                    placeholderTextColor={COLORS.textMuted}
                    value={value}
                    onBlur={onBlur}
                    onChangeText={onChange}
                    autoFocus
                  />
                </View>
              )}
            />
            {errors.title && (
              <View style={styles.errorRow}>
                <Feather name="alert-circle" size={13} color={COLORS.danger} />
                <Text style={styles.errorText}>{errors.title.message}</Text>
              </View>
            )}

            {/* 2. ПОЛЕ: ДАТА */}
            <Text style={[styles.label, { marginTop: 14 }]}>Дата виконання *</Text>
            <Controller
              control={control}
              name="date"
              rules={{ required: 'Вкажіть дату завдання' }}
              render={({ field: { onChange, onBlur, value } }) => (
                <View>
                  <View
                    style={[
                      styles.inputContainer,
                      errors.date && styles.inputErrorBorder,
                    ]}
                  >
                    <Feather
                      name="calendar"
                      size={18}
                      color={COLORS.primary}
                      style={styles.inputIcon}
                    />
                    <TextInput
                      style={styles.textInput}
                      placeholder="Введіть дату або оберіть нижче"
                      placeholderTextColor={COLORS.textMuted}
                      value={value}
                      onBlur={onBlur}
                      onChangeText={onChange}
                    />
                  </View>

                  {/* Швидкі пресети дати */}
                  <View style={styles.datePresets}>
                    <TouchableOpacity
                      style={[
                        styles.dateChip,
                        value === getTodayString() && styles.dateChipActive,
                      ]}
                      onPress={() => onChange(getTodayString())}
                    >
                      <Text
                        style={[
                          styles.dateChipText,
                          value === getTodayString() && styles.dateChipTextActive,
                        ]}
                      >
                        Сьогодні ({getTodayString()})
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[
                        styles.dateChip,
                        value === getTomorrowString() && styles.dateChipActive,
                      ]}
                      onPress={() => onChange(getTomorrowString())}
                    >
                      <Text
                        style={[
                          styles.dateChipText,
                          value === getTomorrowString() && styles.dateChipTextActive,
                        ]}
                      >
                        Завтра ({getTomorrowString()})
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            />
            {errors.date && (
              <View style={styles.errorRow}>
                <Feather name="alert-circle" size={13} color={COLORS.danger} />
                <Text style={styles.errorText}>{errors.date.message}</Text>
              </View>
            )}

            {/* 3. ПОЛЕ: ПРІОРИТЕТ (low, medium, high) */}
            <Text style={[styles.label, { marginTop: 14 }]}>Пріоритет *</Text>
            <Controller
              control={control}
              name="priority"
              rules={{ required: true }}
              render={({ field: { onChange, value } }) => (
                <View style={styles.priorityGroup}>
                  {PRIORITIES.map((p) => {
                    const isSelected = value === p.key;
                    return (
                      <TouchableOpacity
                        key={p.key}
                        activeOpacity={0.8}
                        style={[
                          styles.priorityCard,
                          isSelected && {
                            backgroundColor: p.bg,
                            borderColor: p.text,
                          },
                        ]}
                        onPress={() => onChange(p.key)}
                      >
                        <Feather
                          name={p.icon as any}
                          size={16}
                          color={isSelected ? p.text : COLORS.textMuted}
                        />
                        <Text
                          style={[
                            styles.priorityCardText,
                            isSelected && { color: p.text, fontWeight: '800' },
                          ]}
                        >
                          {p.label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              )}
            />

            {/* СТАТУС ІНФОРМАЦІЯ */}
            <View style={styles.statusInfoBox}>
              <Feather name="info" size={15} color={COLORS.primary} style={{ marginRight: 8 }} />
              <Text style={styles.statusInfoText}>
                Статус за замовчуванням: <Text style={{ fontWeight: '800', color: COLORS.primary }}>to-do</Text>
              </Text>
            </View>

            {/* КНОПКИ ДІЙ */}
            <View style={styles.actions}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={onClose}
                activeOpacity={0.7}
              >
                <Text style={styles.cancelBtnText}>Скасувати</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.submitBtn}
                onPress={() => handleSubmit(onSubmit)()}
                activeOpacity={0.85}
              >
                <Feather name="check-circle" size={18} color="#002966" style={{ marginRight: 6 }} />
                <Text style={styles.submitBtnText}>Зберегти завдання</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
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
    backgroundColor: 'rgba(0, 0, 0, 0.78)',
  },
  sheet: {
    backgroundColor: COLORS.surfaceDark,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingHorizontal: 22,
    paddingTop: 12,
    paddingBottom: 36,
    maxHeight: '90%',
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
    marginBottom: 18,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.textLight,
    letterSpacing: -0.4,
  },
  subtitle: {
    fontSize: 12,
    fontWeight: '700',
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
  label: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.cardDark,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    paddingHorizontal: 16,
    height: 52,
  },
  inputErrorBorder: {
    borderColor: COLORS.danger,
  },
  inputIcon: {
    marginRight: 10,
  },
  textInput: {
    flex: 1,
    fontSize: 15,
    color: COLORS.textLight,
    fontWeight: '600',
  },
  errorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    marginLeft: 4,
  },
  errorText: {
    fontSize: 12,
    color: COLORS.danger,
    fontWeight: '700',
    marginLeft: 6,
  },
  datePresets: {
    flexDirection: 'row',
    marginTop: 8,
    gap: 8,
  },
  dateChip: {
    backgroundColor: COLORS.cardDark,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  dateChipActive: {
    backgroundColor: COLORS.primaryContainer,
    borderColor: COLORS.primary,
  },
  dateChipText: {
    fontSize: 12,
    color: COLORS.textMuted,
    fontWeight: '600',
  },
  dateChipTextActive: {
    color: COLORS.onPrimaryContainer,
    fontWeight: '800',
  },
  priorityGroup: {
    flexDirection: 'column',
    gap: 8,
    marginBottom: 14,
  },
  priorityCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.cardDark,
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    gap: 10,
  },
  priorityCardText: {
    fontSize: 14,
    color: COLORS.textLight,
    fontWeight: '600',
  },
  statusInfoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0E1729',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#1D3461',
    marginBottom: 20,
  },
  statusInfoText: {
    fontSize: 13,
    color: COLORS.textLight,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 4,
  },
  cancelBtn: {
    flex: 1,
    backgroundColor: COLORS.cardDark,
    borderRadius: 20,
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
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
  submitBtnText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#002966',
  },
});
