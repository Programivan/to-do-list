export const COLORS = {
  primary: '#4D86F7',
  primaryDark: '#366FE0',
  primaryLight: '#EBF1FF',
  success: '#3ECB98',
  successDark: '#33B284',
  textDark: '#1A2130',
  textSubtitle: '#242D3C',
  textBody: '#202838',
  textMuted: '#9AA5B6',
  textTime: '#3B4657',
  cardBg: '#FFFFFF',
  screenBg: '#FFFFFF',
  listBg: '#F4F7FB',
  iconInactive: '#A4B0C2',
  border: '#E8EDF5',
  cardBorder: '#EEF2F7',
  danger: '#EF4444',
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
  // Matches the sequence from the mock: 12 pm, 1 pm, 3 pm, 4 pm, 5 pm, ...
  const mockSequence = ['12 pm', '1 pm', '3 pm', '4 pm', '5 pm', '6 pm', '7 pm', '9 am', '10 am', '11 am'];
  if (index < mockSequence.length) {
    return mockSequence[index];
  }
  return DEFAULT_TIMES[(id + index) % DEFAULT_TIMES.length];
}
