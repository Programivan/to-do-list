import { MD3DarkTheme } from 'react-native-paper';

export const M3DarkTheme = {
  ...MD3DarkTheme,
  dark: true,
  colors: {
    ...MD3DarkTheme.colors,
    primary: '#A8C7FA',
    onPrimary: '#062E6F',
    primaryContainer: '#0842A0',
    onPrimaryContainer: '#D3E3FD',
    secondary: '#C2E7FF',
    onSecondary: '#003355',
    secondaryContainer: '#004A77',
    onSecondaryContainer: '#C2E7FF',
    tertiary: '#C4E7FF',
    surface: '#000000', // AMOLED pure black
    surfaceContainerLowest: '#0A0B0E',
    surfaceContainerLow: '#121316',
    surfaceContainer: '#1A1C1F', // Card surface
    surfaceContainerHigh: '#23252A',
    surfaceContainerHighest: '#2E3036',
    onSurface: '#E3E2E6',
    onSurfaceVariant: '#C4C6D0',
    outline: '#44474E',
    outlineVariant: '#2E3036',
    background: '#000000',
    error: '#F2B8B5',
    errorContainer: '#8C1D18',
    onError: '#601410',
    onErrorContainer: '#F9DEDC',
    success: '#81C995',
  },
};

export const COLORS = {
  black: '#000000',
  surfaceDark: '#121316',
  cardDark: '#1A1C20',
  cardDarkElevated: '#24262C',
  primary: '#A8C7FA',
  primaryDark: '#0842A0',
  primaryLight: '#1B2A47',
  primaryContainer: '#0842A0',
  onPrimaryContainer: '#D3E3FD',
  success: '#81C995',
  successDark: '#2E7D32',
  danger: '#F2B8B5',
  textLight: '#E3E2E6',
  textDark: '#E3E2E6',
  textSubtitle: '#C4C6D0',
  textBody: '#E3E2E6',
  textMuted: '#90949F',
  textTime: '#A8C7FA',
  cardBg: '#1A1C20',
  cardBorder: '#2A2C32',
  screenBg: '#000000',
  listBg: '#000000',
  iconInactive: '#717582',
  border: '#2A2C32',
  white: '#FFFFFF',
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
