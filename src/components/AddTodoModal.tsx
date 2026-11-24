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
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

import { Priority, TodoFormData } from '../types/todo';
import { COLORS, GLASS_TOKENS, MaterialYouPalette } from '../constants/theme';
import { triggerHaptic, triggerNotificationHaptic } from '../utils/haptics';

interface AddTodoModalProps {
  visible: boolean;
  onClose: () => void;
  onAdd: (data: TodoFormData) => void;
  theme: MaterialYouPalette;
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

function getDayAfterTomorrowString(): string {
  const d = new Date();
  d.setDate(d.getDate() + 2);
  const day = d.getDate();
  const months = [
    'Січ', 'Лют', 'Бер', 'Кві', 'Тра', 'Чер',
    'Лип', 'Сер', 'Вер', 'Жов', 'Лис', 'Гру',
  ];
  return `${day} ${months[d.getMonth()]}`;
}

const PRIORITIES: { key: Priority; label: string; icon: any; bg: string; border: string; text: string }[] = [
  {
    key: 'high',
    label: 'Високий (High)',
    icon: 'alert-triangle',
    bg: 'rgba(120, 24, 30, 0.45)',
    border: 'rgba(255, 120, 120, 0.50)',
    text: '#FFA4A2',
  },
  {
    key: 'medium',
    label: 'Середній (Med)',
    icon: 'clock',
    bg: 'rgba(110, 65, 15, 0.45)',
    border: 'rgba(255, 195, 100, 0.50)',
    text: '#FFCF87',
  },
  {
    key: 'low',
    label: 'Низький (Low)',
    icon: 'arrow-down',
    bg: 'rgba(20, 70, 110, 0.45)',
    border: 'rgba(130, 205, 255, 0.50)',
    text: '#82D0FF',
  },
];

export const AddTodoModal: React.FC<AddTodoModalProps> = ({
  visible,
  onClose,
  onAdd,
  theme,
}) => {
  const [slideAnim] = useState(() => new Animated.Value(450));
  const [fadeAnim] = useState(() => new Animated.Value(0));

  // React Hook Form
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
      status: 'to-do',
    },
    mode: 'onChange',
  });

  useEffect(() => {
    if (visible) {
      reset({
        title: '',
        date: getTodayString(),
        priority: 'medium',
        status: 'to-do',
      });
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 220,
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          friction: 8,
          tension: 130,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      slideAnim.setValue(450);
      fadeAnim.setValue(0);
    }
  }, [visible, slideAnim, fadeAnim, reset]);

  const onSubmit = (data: TodoFormData) => {
    triggerNotificationHaptic(Haptics.NotificationFeedbackType.Success);
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
        {/* Real Frosted Glass Backdrop */}
        <Animated.View style={[styles.backdrop, { opacity: fadeAnim }]}>
          <BlurView intensity={GLASS_TOKENS.blurIntensityHeader} tint="dark" style={StyleSheet.absoluteFill} />
          <TouchableOpacity
            style={StyleSheet.absoluteFill}
            activeOpacity={1}
            onPress={() => {
              triggerHaptic(Haptics.ImpactFeedbackStyle.Light);
              onClose();
            }}
          />
        </Animated.View>

        {/* Modal Bottom Sheet */}
        <Animated.View
          style={[
            styles.sheet,
            { transform: [{ translateY: slideAnim }] },
          ]}
        >
          {/* Frosted Glass Surface Blur */}
          <BlurView intensity={GLASS_TOKENS.blurIntensityModal} tint="dark" style={StyleSheet.absoluteFill} />

          {/* Specular Refraction Highlight Line */}
          <LinearGradient
            colors={GLASS_TOKENS.sheenGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.specularLine}
          />

          {/* Drag Handle */}
          <View style={styles.dragHandle} />

          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerTitleGroup}>
              <View style={[styles.modalIconBadge, { backgroundColor: theme.primaryContainer }]}>
                <Feather name="plus-circle" size={18} color={theme.primary} />
              </View>
              <View>
                <Text style={styles.title}>Нове завдання</Text>
                <Text style={styles.subtitle}>Створення нового завдання</Text>
              </View>
            </View>
            <TouchableOpacity
              onPress={() => {
                triggerHaptic(Haptics.ImpactFeedbackStyle.Light);
                onClose();
              }}
              style={styles.closeBtn}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Feather name="x" size={18} color="#A3A7B5" />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
            {/* 1. ПОЛЕ: НАЗВА (React Hook Form) */}
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
                    styles.glassInputContainer,
                    errors.title && styles.inputErrorBorder,
                  ]}
                >
                  <Feather
                    name="edit-3"
                    size={17}
                    color={errors.title ? COLORS.danger : theme.primary}
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.textInput}
                    placeholder="Наприклад: Підготувати звіт"
                    placeholderTextColor="#6A6F80"
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

            {/* 2. ПОЛЕ: ДАТА (React Hook Form) */}
            <Text style={[styles.label, { marginTop: 14 }]}>Дата виконання *</Text>
            <Controller
              control={control}
              name="date"
              rules={{ required: 'Вкажіть дату завдання' }}
              render={({ field: { onChange, onBlur, value } }) => (
                <View>
                  <View
                    style={[
                      styles.glassInputContainer,
                      errors.date && styles.inputErrorBorder,
                    ]}
                  >
                    <Feather
                      name="calendar"
                      size={17}
                      color={theme.primary}
                      style={styles.inputIcon}
                    />
                    <TextInput
                      style={styles.textInput}
                      placeholder="Введіть дату або оберіть пресет"
                      placeholderTextColor="#6A6F80"
                      value={value}
                      onBlur={onBlur}
                      onChangeText={onChange}
                    />
                  </View>

                  {/* Date Presets */}
                  <View style={styles.datePresets}>
                    <TouchableOpacity
                      style={[
                        styles.dateChip,
                        value === getTodayString() && [
                          styles.dateChipActive,
                          { borderColor: theme.primary, backgroundColor: `${theme.primary}20` },
                        ],
                      ]}
                      onPress={() => {
                        triggerHaptic(Haptics.ImpactFeedbackStyle.Light);
                        onChange(getTodayString());
                      }}
                    >
                      <Text
                        style={[
                          styles.dateChipText,
                          value === getTodayString() && { color: theme.primary, fontWeight: '800' },
                        ]}
                      >
                        Сьогодні ({getTodayString()})
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[
                        styles.dateChip,
                        value === getTomorrowString() && [
                          styles.dateChipActive,
                          { borderColor: theme.primary, backgroundColor: `${theme.primary}20` },
                        ],
                      ]}
                      onPress={() => {
                        triggerHaptic(Haptics.ImpactFeedbackStyle.Light);
                        onChange(getTomorrowString());
                      }}
                    >
                      <Text
                        style={[
                          styles.dateChipText,
                          value === getTomorrowString() && { color: theme.primary, fontWeight: '800' },
                        ]}
                      >
                        Завтра ({getTomorrowString()})
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[
                        styles.dateChip,
                        value === getDayAfterTomorrowString() && [
                          styles.dateChipActive,
                          { borderColor: theme.primary, backgroundColor: `${theme.primary}20` },
                        ],
                      ]}
                      onPress={() => {
                        triggerHaptic(Haptics.ImpactFeedbackStyle.Light);
                        onChange(getDayAfterTomorrowString());
                      }}
                    >
                      <Text
                        style={[
                          styles.dateChipText,
                          value === getDayAfterTomorrowString() && { color: theme.primary, fontWeight: '800' },
                        ]}
                      >
                        +{getDayAfterTomorrowString()}
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

            {/* 3. ПОЛЕ: ПРІОРИТЕТ (low, medium, high - React Hook Form) */}
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
                        onPress={() => {
                          triggerHaptic(Haptics.ImpactFeedbackStyle.Light);
                          onChange(p.key);
                        }}
                      >
                        <Feather
                          name={p.icon}
                          size={15}
                          color={isSelected ? p.text : '#7E8497'}
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

            {/* 4. ПОЛЕ: СТАТУС (done/to-do, за замовчуванням: to-do) */}
            <Text style={[styles.label, { marginTop: 14 }]}>Статус завдання (done / to-do) *</Text>
            <Controller
              control={control}
              name="status"
              defaultValue="to-do"
              render={({ field: { onChange, value } }) => (
                <View style={styles.statusSegmentContainer}>
                  <TouchableOpacity
                    activeOpacity={0.8}
                    style={[
                      styles.statusSegmentBtn,
                      value === 'to-do' && [
                        styles.statusSegmentActive,
                        {
                          backgroundColor: `${theme.primary}22`,
                          borderColor: theme.primary,
                        },
                      ],
                    ]}
                    onPress={() => {
                      triggerHaptic(Haptics.ImpactFeedbackStyle.Light);
                      onChange('to-do');
                    }}
                  >
                    <View
                      style={[
                        styles.statusDot,
                        { backgroundColor: value === 'to-do' ? theme.primary : '#7E8497' },
                      ]}
                    />
                    <Text
                      style={[
                        styles.statusSegmentText,
                        value === 'to-do' && { color: theme.primary, fontWeight: '800' },
                      ]}
                    >
                      to-do (в процесі)
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    activeOpacity={0.8}
                    style={[
                      styles.statusSegmentBtn,
                      value === 'done' && [
                        styles.statusSegmentActive,
                        {
                          backgroundColor: 'rgba(56, 201, 133, 0.22)',
                          borderColor: '#69E2A8',
                        },
                      ],
                    ]}
                    onPress={() => {
                      triggerHaptic(Haptics.ImpactFeedbackStyle.Light);
                      onChange('done');
                    }}
                  >
                    <View
                      style={[
                        styles.statusDot,
                        { backgroundColor: value === 'done' ? '#69E2A8' : '#7E8497' },
                      ]}
                    />
                    <Text
                      style={[
                        styles.statusSegmentText,
                        value === 'done' && { color: '#69E2A8', fontWeight: '800' },
                      ]}
                    >
                      done (виконано)
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            />

            {/* Підказка згідно з PDF: статус за замовчуванням to-do */}
            <View style={[styles.statusInfoBox, { borderColor: `${theme.primary}40`, backgroundColor: `${theme.primary}12` }]}>
              <Feather name="info" size={14} color={theme.primary} style={{ marginRight: 8 }} />
              <Text style={styles.statusInfoText}>
                Статус за замовчуванням встановлено на: <Text style={{ fontWeight: '800', color: theme.primary }}>to-do</Text>
              </Text>
            </View>

            {/* КНОПКИ ДІЙ */}
            <View style={styles.actions}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => {
                  triggerHaptic(Haptics.ImpactFeedbackStyle.Light);
                  onClose();
                }}
                activeOpacity={0.7}
              >
                <Text style={styles.cancelBtnText}>Скасувати</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.submitBtn}
                onPress={() => {
                  handleSubmit(onSubmit)();
                }}
                activeOpacity={0.85}
              >
                <LinearGradient
                  colors={theme.accentGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.submitBtnGradient}
                >
                  <Feather name="check" size={18} color={theme.onPrimary} style={{ marginRight: 6 }} />
                  <Text style={[styles.submitBtnText, { color: theme.onPrimary }]}>Створити завдання</Text>
                </LinearGradient>
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
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
  },
  sheet: {
    backgroundColor: GLASS_TOKENS.modalGlassBg,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: Platform.OS === 'ios' ? 36 : 24,
    maxHeight: '88%',
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: GLASS_TOKENS.glassBorderHighlight,
    borderBottomWidth: 0,
  },
  specularLine: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 2,
  },
  dragHandle: {
    width: 44,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.22)',
    alignSelf: 'center',
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 18,
  },
  headerTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  modalIconBadge: {
    width: 38,
    height: 38,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 19,
    fontWeight: '800',
    color: '#F5F6FA',
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 12,
    color: '#7E8497',
    marginTop: 2,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    color: '#C6CBDA',
    marginBottom: 6,
    letterSpacing: 0.2,
  },
  glassInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: GLASS_TOKENS.inputGlassBg,
    borderRadius: 16,
    paddingHorizontal: 14,
    height: 50,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  inputIcon: {
    marginRight: 10,
  },
  textInput: {
    flex: 1,
    fontSize: 14,
    color: '#F5F6FA',
    fontWeight: '600',
  },
  inputErrorBorder: {
    borderColor: COLORS.danger,
  },
  errorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 5,
  },
  errorText: {
    fontSize: 12,
    color: COLORS.danger,
    fontWeight: '600',
  },
  datePresets: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
    flexWrap: 'wrap',
  },
  dateChip: {
    paddingVertical: 7,
    paddingHorizontal: 11,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.10)',
  },
  dateChipActive: {},
  dateChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#7E8497',
  },
  priorityGroup: {
    gap: 8,
  },
  priorityCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 11,
    paddingHorizontal: 14,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    gap: 10,
  },
  priorityCardText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#C6CBDA',
  },
  statusSegmentContainer: {
    flexDirection: 'row',
    gap: 10,
  },
  statusSegmentBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    gap: 8,
  },
  statusSegmentActive: {},
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusSegmentText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#7E8497',
  },
  statusInfoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 14,
    marginTop: 16,
    borderWidth: 1,
  },
  statusInfoText: {
    fontSize: 12,
    color: '#C6CBDA',
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 22,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.10)',
  },
  cancelBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#C6CBDA',
  },
  submitBtn: {
    flex: 1.8,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  submitBtnGradient: {
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitBtnText: {
    fontSize: 14,
    fontWeight: '800',
  },
});
