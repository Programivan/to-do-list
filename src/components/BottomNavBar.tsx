import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { TabType } from '../types/todo';
import { COLORS } from '../constants/theme';

interface BottomNavBarProps {
  activeTab: TabType;
  onSelectTab: (tab: TabType) => void;
  onOpenAddModal: () => void;
  bottomInset?: number;
}

export const BottomNavBar: React.FC<BottomNavBarProps> = ({
  activeTab,
  onSelectTab,
  onOpenAddModal,
  bottomInset = 0,
}) => {
  return (
    <View style={[styles.wrapper, { paddingBottom: Math.max(bottomInset, 12) }]}>
      <View style={styles.container}>
        {/* Left Side: List & Clock */}
        <View style={styles.navGroup}>
          <TouchableOpacity
            style={styles.tabButton}
            onPress={() => onSelectTab('all')}
            activeOpacity={0.7}
          >
            <Feather
              name="list"
              size={22}
              color={activeTab === 'all' ? COLORS.primary : COLORS.iconInactive}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.tabButton}
            onPress={() => onSelectTab('pending')}
            activeOpacity={0.7}
          >
            <Feather
              name="clock"
              size={22}
              color={activeTab === 'pending' ? COLORS.primary : COLORS.iconInactive}
            />
          </TouchableOpacity>
        </View>

        {/* Floating Action Button (FAB) + Placeholder in row */}
        <View style={styles.fabCenterContainer}>
          <TouchableOpacity
            style={styles.fab}
            onPress={onOpenAddModal}
            activeOpacity={0.85}
          >
            <Feather name="plus" size={28} color={COLORS.white} />
          </TouchableOpacity>
        </View>

        {/* Right Side: Bell & User */}
        <View style={styles.navGroup}>
          <TouchableOpacity
            style={styles.tabButton}
            onPress={() => onSelectTab('completed')}
            activeOpacity={0.7}
          >
            <Feather
              name="bell"
              size={22}
              color={activeTab === 'completed' ? COLORS.primary : COLORS.iconInactive}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.tabButton}
            onPress={() => onSelectTab('profile')}
            activeOpacity={0.7}
          >
            <Feather
              name="user"
              size={22}
              color={activeTab === 'profile' ? COLORS.primary : COLORS.iconInactive}
            />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: COLORS.screenBg,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: 8,
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    height: 56,
  },
  navGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    flex: 1,
  },
  tabButton: {
    padding: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fabCenterContainer: {
    width: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fab: {
    position: 'absolute',
    top: -24,
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    // Shadow
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 8,
    borderWidth: 3,
    borderColor: COLORS.white,
  },
});
