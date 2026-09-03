/** Move an `HH:MM` time by whole minutes, wrapping around midnight. */
export function shiftTime(hhmm: string, deltaMin: number): string {
  const [h, m] = hhmm.split(':').map(Number);
  const total = (((h * 60 + m + deltaMin) % 1440) + 1440) % 1440;
  return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`;
}

/** Live-format raw keypad input into an `HH:MM` mask while typing. */
export function formatTimeDraft(input: string): string {
  const digits = input.replace(/\D/g, '').slice(0, 4);
  if (digits.length <= 2) return digits;
  return `${digits.slice(0, 2)}:${digits.slice(2)}`;
}

/** Normalise a typed value to a valid `HH:MM`; null if it can't be a real time. */
export function normalizeTime(input: string): string | null {
  const digits = input.replace(/\D/g, '');
  if (digits.length === 0) return null;
  let h: number;
  let m: number;
  if (digits.length <= 2) {
    h = parseInt(digits, 10);
    m = 0;
  } else {
    h = parseInt(digits.slice(0, digits.length - 2), 10);
    m = parseInt(digits.slice(digits.length - 2), 10);
  }
  if (Number.isNaN(h) || Number.isNaN(m) || h > 23 || m > 59) return null;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}
