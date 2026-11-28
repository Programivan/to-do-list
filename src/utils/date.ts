const ORDINAL_MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

function getOrdinalSuffix(day: number): string {
  if (day > 3 && day < 21) return 'th';
  switch (day % 10) {
    case 1:
      return 'st';
    case 2:
      return 'nd';
    case 3:
      return 'rd';
    default:
      return 'th';
  }
}

/**
 * Formats the current date as e.g. "28th November 2026".
 */
export function getFormattedDate(): string {
  const d = new Date();
  const day = d.getDate();
  return `${day}${getOrdinalSuffix(day)} ${ORDINAL_MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}
