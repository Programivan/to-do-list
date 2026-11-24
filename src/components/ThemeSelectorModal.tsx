import React from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import {
  MaterialYouPaletteId,
  MATERIAL_YOU_PALETTES,
  GLASS_TOKENS,
} from '../constants/theme';
import { triggerSelectionHaptic } from '../utils/haptics';

interface ThemeSelectorModalProps {
  visible: boolean;
  activePaletteId: MaterialYouPaletteId;
  onSelectPalette: (id: MaterialYouPaletteId) => void;
  onClose: () => void;
}

export const ThemeSelectorModal: React.FC<ThemeSelectorModalProps> = ({
  visible,
  activePaletteId,
  onSelectPalette,
  onClose,
}) => {
  const currentTheme = MATERIAL_YOU_PALETTES[activePaletteId];

  const handleSelect = (id: MaterialYouPaletteId) => {
    triggerSelectionHaptic();
    onSelectPalette(id);
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={styles.modalCard}>
              {/* Frosted Glass Background */}
              <BlurView intensity={GLASS_TOKENS.blurIntensityModal} tint="dark" style={StyleSheet.absoluteFill} />

              {/* Specular Refraction Line at Top Edge */}
              <LinearGradient
                colors={GLASS_TOKENS.sheenGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.specularSheen}
              />

              {/* Header */}
              <View style={styles.header}>
                <View style={styles.headerTitleGroup}>
                  <View style={[styles.paletteIconBadge, { backgroundColor: currentTheme.primaryContainer }]}>
                    <Feather name="droplet" size={16} color={currentTheme.primary} />
                  </View>
                  <View>
                    <Text style={styles.title}>Material You Палітра</Text>
                    <Text style={styles.subtitle}>Динамічні кольори Material 3 & Скло</Text>
                  </View>
                </View>
                <TouchableOpacity onPress={onClose} style={styles.closeBtn} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                  <Feather name="x" size={18} color="#A3A7B5" />
                </TouchableOpacity>
              </View>

              {/* Palette List */}
              <View style={styles.palettesList}>
                {(Object.keys(MATERIAL_YOU_PALETTES) as MaterialYouPaletteId[]).map((id) => {
                  const palette = MATERIAL_YOU_PALETTES[id];
                  const isSelected = id === activePaletteId;

                  return (
                    <TouchableOpacity
                      key={id}
                      style={[
                        styles.paletteOption,
                        isSelected && {
                          borderColor: palette.primary,
                          backgroundColor: 'rgba(255, 255, 255, 0.08)',
                        },
                      ]}
                      onPress={() => handleSelect(id)}
                      activeOpacity={0.75}
                    >
                      {/* Color Preview Swatch */}
                      <LinearGradient
                        colors={palette.accentGradient}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.colorSwatch}
                      >
                        {isSelected && <Feather name="check" size={14} color="#000" />}
                      </LinearGradient>

                      <View style={styles.paletteInfo}>
                        <Text style={[styles.paletteName, isSelected && { color: palette.primary, fontWeight: '800' }]}>
                          {palette.nameUa}
                        </Text>
                        <Text style={styles.paletteDetail}>{palette.name}</Text>
                      </View>

                      {isSelected && (
                        <View style={[styles.selectedPill, { backgroundColor: palette.primaryContainer }]}>
                          <Text style={[styles.selectedPillText, { color: palette.primary }]}>Активна</Text>
                        </View>
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>

              <TouchableOpacity
                style={[styles.doneBtn, { backgroundColor: currentTheme.primary }]}
                onPress={onClose}
                activeOpacity={0.8}
              >
                <Text style={[styles.doneBtnText, { color: currentTheme.onPrimary }]}>Застосувати</Text>
              </TouchableOpacity>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modalCard: {
    width: '100%',
    maxWidth: 380,
    borderRadius: 28,
    overflow: 'hidden',
    padding: 22,
    borderWidth: 1.5,
    borderColor: GLASS_TOKENS.glassBorderHighlight,
    backgroundColor: GLASS_TOKENS.modalGlassBg,
  },
  specularSheen: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 2,
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
  paletteIconBadge: {
    width: 38,
    height: 38,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 18,
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
  palettesList: {
    gap: 10,
    marginBottom: 20,
  },
  paletteOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
  },
  colorSwatch: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  paletteInfo: {
    flex: 1,
  },
  paletteName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#F5F6FA',
  },
  paletteDetail: {
    fontSize: 12,
    color: '#7E8497',
    marginTop: 1,
  },
  selectedPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  selectedPillText: {
    fontSize: 11,
    fontWeight: '800',
  },
  doneBtn: {
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  doneBtnText: {
    fontSize: 15,
    fontWeight: '800',
  },
});
