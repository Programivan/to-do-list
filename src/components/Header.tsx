import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { COLORS } from '../constants/theme';

interface HeaderProps {
  totalTasks: number;
  completedTasks: number;
  currentDateText: string;
  onToggleDate?: () => void;
  isCustomDate?: boolean;
  onOpenSearch?: () => void;
  isSearchActive?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  totalTasks,
  completedTasks,
  currentDateText,
  onToggleDate,
  isCustomDate,
  onOpenSearch,
  isSearchActive,
}) => {
  return (
    <View style={styles.container}>
      {/* Centered Main Title as in mockup */}
      <View style={styles.topRow}>
        <View style={styles.sidePlaceholder} />
        <Text style={styles.appTitle}>ToDo List</Text>
        <TouchableOpacity
          onPress={onOpenSearch}
          style={styles.searchIconButton}
          activeOpacity={0.7}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Feather
            name={isSearchActive ? 'x' : 'search'}
            size={20}
            color={isSearchActive ? COLORS.primary : COLORS.iconInactive}
          />
        </TouchableOpacity>
      </View>

      {/* Date row aligned with list items */}
      <View style={styles.dateRow}>
        <TouchableOpacity
          onPress={onToggleDate}
          activeOpacity={0.7}
          style={styles.dateContainer}
        >
          <Text style={styles.dateText}>{currentDateText}</Text>
          {onToggleDate && (
            <Feather
              name="repeat"
              size={12}
              color={COLORS.textMuted}
              style={styles.dateToggleIcon}
            />
          )}
        </TouchableOpacity>

        {/* Task counter pill */}
        <View style={styles.counterBadge}>
          <Text style={styles.counterText}>
            {completedTasks}/{totalTasks}
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.screenBg,
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 16,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 28,
  },
  sidePlaceholder: {
    width: 36,
  },
  appTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: COLORS.textDark,
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  searchIconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.listBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateText: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.textSubtitle,
    letterSpacing: -0.3,
  },
  dateToggleIcon: {
    marginLeft: 6,
  },
  counterBadge: {
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  counterText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primaryDark,
  },
});
