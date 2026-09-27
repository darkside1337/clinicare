/**
 * Calculates accurate age from date of birth string.
 * Supports ISO (YYYY-MM-DD) and UK (DD/MM/YYYY) formats.
 * Bounds: returns null if empty, invalid, future date, or age > 125.
 */
export function calculateAge(dob?: string | null): number | null {
  if (!dob || typeof dob !== "string") return null;
  const trimmed = dob.trim();
  if (!trimmed) return null;

  const parts = trimmed.includes("-") ? trimmed.split("-") : trimmed.split("/").reverse();
  if (parts.length !== 3) return null;

  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10);
  const day = parseInt(parts[2], 10);

  if (isNaN(year) || isNaN(month) || isNaN(day)) return null;
  if (year < 1900) return null;

  const birthDate = new Date(year, month - 1, day);
  if (isNaN(birthDate.getTime())) return null;

  const today = new Date();
  if (birthDate > today) return null;

  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }

  if (age < 0 || age > 125) return null;
  return age;
}
