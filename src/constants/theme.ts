import { MD3DarkTheme } from 'react-native-paper';

export type MaterialYouPaletteId = 'ocean' | 'lavender' | 'sunset' | 'emerald' | 'amber';

export interface MaterialYouPalette {
  id: MaterialYouPaletteId;
  name: string;
  nameUa: string;
  primary: string;
  onPrimary: string;
  primaryContainer: string;
  onPrimaryContainer: string;
  secondary: string;
  onSecondary: string;
  secondaryContainer: string;
  onSecondaryContainer: string;
  tertiary: string;
  onTertiary: string;
  tertiaryContainer: string;
  onTertiaryContainer: string;
  accentGradient: [string, string];
  glowColor: string;
  ambientBlob1: string;
  ambientBlob2: string;
  ambientBlob3: string;
}

export const MATERIAL_YOU_PALETTES: Record<MaterialYouPaletteId, MaterialYouPalette> = {
  ocean: {
    id: 'ocean',
    name: 'Ocean Dynamic',
    nameUa: 'Океан (M3 Blue)',
    primary: '#7CA8FF',
    onPrimary: '#002B6D',
    primaryContainer: '#1D3D78',
    onPrimaryContainer: '#D7E3FF',
    secondary: '#82D0FF',
    onSecondary: '#00344F',
    secondaryContainer: '#004C70',
    onSecondaryContainer: '#C6E7FF',
    tertiary: '#D8B4FE',
    onTertiary: '#3C076F',
    tertiaryContainer: '#4B227B',
    onTertiaryContainer: '#F2DAFF',
    accentGradient: ['#7CA8FF', '#4B88FF'],
    glowColor: 'rgba(124, 168, 255, 0.45)',
    ambientBlob1: 'rgba(40, 80, 160, 0.35)',
    ambientBlob2: 'rgba(100, 45, 150, 0.28)',
    ambientBlob3: 'rgba(20, 85, 120, 0.25)',
  },
  lavender: {
    id: 'lavender',
    name: 'Lavender Mist',
    nameUa: 'Лаванда (Expressive)',
    primary: '#D8B4FE',
    onPrimary: '#430076',
    primaryContainer: '#54228A',
    onPrimaryContainer: '#F2DAFF',
    secondary: '#FFAF96',
    onSecondary: '#5C1A05',
    secondaryContainer: '#452015',
    onSecondaryContainer: '#FFDBCF',
    tertiary: '#9AD6FF',
    onTertiary: '#003450',
    tertiaryContainer: '#004B72',
    onTertiaryContainer: '#CEE5FF',
    accentGradient: ['#D8B4FE', '#B77DF8'],
    glowColor: 'rgba(216, 180, 254, 0.45)',
    ambientBlob1: 'rgba(110, 40, 170, 0.35)',
    ambientBlob2: 'rgba(30, 60, 140, 0.30)',
    ambientBlob3: 'rgba(150, 40, 90, 0.25)',
  },
  sunset: {
    id: 'sunset',
    name: 'Sunset Peach',
    nameUa: 'Персик (Warm Sunset)',
    primary: '#FFAF96',
    onPrimary: '#5C1A05',
    primaryContainer: '#6E2713',
    onPrimaryContainer: '#FFDBCF',
    secondary: '#FFD485',
    onSecondary: '#442B00',
    secondaryContainer: '#624000',
    onSecondaryContainer: '#FFE0A6',
    tertiary: '#FF8FAC',
    onTertiary: '#5C0028',
    tertiaryContainer: '#7D0039',
    onTertiaryContainer: '#FFD9DF',
    accentGradient: ['#FFAF96', '#FF8B6B'],
    glowColor: 'rgba(255, 175, 150, 0.45)',
    ambientBlob1: 'rgba(160, 50, 30, 0.35)',
    ambientBlob2: 'rgba(140, 20, 80, 0.28)',
    ambientBlob3: 'rgba(40, 40, 110, 0.25)',
  },
  emerald: {
    id: 'emerald',
    name: 'Emerald Mint',
    nameUa: 'Смарагд (Mint Natural)',
    primary: '#69E2A8',
    onPrimary: '#003920',
    primaryContainer: '#135433',
    onPrimaryContainer: '#B3F7D2',
    secondary: '#76DCE3',
    onSecondary: '#00363B',
    secondaryContainer: '#004F56',
    onSecondaryContainer: '#98F2FA',
    tertiary: '#A6D2FF',
    onTertiary: '#003258',
    tertiaryContainer: '#00497B',
    onTertiaryContainer: '#D3E4FF',
    accentGradient: ['#69E2A8', '#38C985'],
    glowColor: 'rgba(105, 226, 168, 0.45)',
    ambientBlob1: 'rgba(25, 120, 75, 0.35)',
    ambientBlob2: 'rgba(20, 80, 120, 0.28)',
    ambientBlob3: 'rgba(90, 85, 20, 0.22)',
  },
  amber: {
    id: 'amber',
    name: 'Amber Honey',
    nameUa: 'Бурштин (Honey Gold)',
    primary: '#FDD663',
    onPrimary: '#3F2E00',
    primaryContainer: '#5B4300',
    onPrimaryContainer: '#FFEFA6',
    secondary: '#FFB68C',
    onSecondary: '#522300',
    secondaryContainer: '#743500',
    onSecondaryContainer: '#FFDCC4',
    tertiary: '#B8E186',
    onTertiary: '#223600',
    tertiaryContainer: '#354E00',
    onTertiaryContainer: '#D4FDA0',
    accentGradient: ['#FDD663', '#F5BC18'],
    glowColor: 'rgba(253, 214, 99, 0.45)',
    ambientBlob1: 'rgba(140, 95, 10, 0.35)',
    ambientBlob2: 'rgba(130, 35, 40, 0.28)',
    ambientBlob3: 'rgba(30, 70, 110, 0.25)',
  },
};

// Liquid Glass Design Tokens (Жидке Скло)
export const GLASS_TOKENS = {
  // Translucent glass backgrounds
  cardGlassBg: 'rgba(22, 26, 38, 0.65)',
  cardGlassBgElevated: 'rgba(30, 36, 52, 0.78)',
  cardGlassCompletedBg: 'rgba(14, 17, 24, 0.55)',
  appBarGlassBg: 'rgba(12, 14, 22, 0.72)',
  modalGlassBg: 'rgba(18, 22, 34, 0.88)',
  inputGlassBg: 'rgba(10, 12, 18, 0.60)',
  chipGlassBg: 'rgba(255, 255, 255, 0.05)',
  chipGlassActiveBg: 'rgba(124, 168, 255, 0.16)',

  // Crystal edge refraction borders
  glassBorder: 'rgba(255, 255, 255, 0.12)',
  glassBorderHighlight: 'rgba(255, 255, 255, 0.24)',
  glassBorderSubtle: 'rgba(255, 255, 255, 0.07)',
  glassBorderCompleted: 'rgba(255, 255, 255, 0.05)',

  // Specular sheen highlight lines
  sheenGradient: ['rgba(255, 255, 255, 0.28)', 'rgba(255, 255, 255, 0.06)', 'transparent'] as [string, string, string],
  sheenGradientSubtle: ['rgba(255, 255, 255, 0.16)', 'rgba(255, 255, 255, 0.02)', 'transparent'] as [string, string, string],

  // Blur intensity for expo-blur
  blurIntensityCard: 50,
  blurIntensityHeader: 65,
  blurIntensityModal: 80,
  blurIntensityPill: 40,
};

// Default export COLORS for backward compatibility
export const COLORS = {
  black: '#000000',
  surfaceDark: '#08090C',
  cardDark: '#161820',
  cardDarkElevated: '#1F222B',
  cardCompleted: '#101217',
  primary: '#7CA8FF',
  primaryDark: '#002B6D',
  primaryLight: '#D7E3FF',
  primaryContainer: '#1D3D78',
  onPrimaryContainer: '#D7E3FF',
  secondary: '#FFAF96',
  tertiary: '#D8B4FE',
  success: '#69E2A8',
  successContainer: '#0E3B27',
  onSuccessContainer: '#B3F7D2',
  danger: '#FFB4AB',
  dangerContainer: '#541517',
  priorityHighBg: 'rgba(92, 28, 30, 0.55)',
  priorityHighBorder: 'rgba(255, 120, 120, 0.40)',
  priorityHighText: '#FFA4A2',
  priorityMedBg: 'rgba(80, 50, 15, 0.55)',
  priorityMedBorder: 'rgba(255, 190, 100, 0.40)',
  priorityMedText: '#FFCF87',
  priorityLowBg: 'rgba(20, 60, 90, 0.55)',
  priorityLowBorder: 'rgba(120, 190, 255, 0.40)',
  priorityLowText: '#82D0FF',
  textLight: '#F5F6FA',
  textDark: '#F5F6FA',
  textSubtitle: '#A3A7B5',
  textBody: '#F5F6FA',
  textMuted: '#7E8497',
  textTime: '#7CA8FF',
  cardBg: '#161820',
  cardBorder: '#272A35',
  cardBorderCompleted: '#1C1F28',
  screenBg: '#08090C',
  listBg: '#08090C',
  iconInactive: '#7E8497',
  border: '#272A35',
  white: '#FFFFFF',
};

export const M3ExpressiveDarkTheme = {
  ...MD3DarkTheme,
  dark: true,
  colors: {
    ...MD3DarkTheme.colors,
    primary: COLORS.primary,
    onPrimary: COLORS.primaryDark,
    primaryContainer: COLORS.primaryContainer,
    onPrimaryContainer: COLORS.onPrimaryContainer,
    secondary: COLORS.secondary,
    surface: COLORS.surfaceDark,
    background: COLORS.black,
    error: COLORS.danger,
    success: COLORS.success,
  },
};

export const DEFAULT_TIMES = [
  '12 pm',
  '1 pm',
  '3 pm',
  '4 pm',
  '5 pm',
  '6 pm',
  '7 pm',
  '9 am',
  '10 am',
  '11 am',
  '2 pm',
];

export function getTaskTime(index: number, id: number): string {
  const mockSequence = ['12 pm', '1 pm', '3 pm', '4 pm', '5 pm', '6 pm', '7 pm', '9 am', '10 am', '11 am'];
  if (index < mockSequence.length) {
    return mockSequence[index];
  }
  return DEFAULT_TIMES[(id + index) % DEFAULT_TIMES.length];
}
