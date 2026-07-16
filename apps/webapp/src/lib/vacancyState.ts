// Vakansiya bookmark + ariza holati (mock bosqichи: localStorage).
// Run 2'da saved_items / requests jadvallariga ulanadi.

function readSet(key: string): Set<string> {
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return new Set();
    const arr = JSON.parse(raw) as unknown;
    return new Set(Array.isArray(arr) ? arr.filter((x) => typeof x === "string") : []);
  } catch {
    return new Set();
  }
}

function writeSet(key: string, set: Set<string>): void {
  try {
    window.localStorage.setItem(key, JSON.stringify([...set]));
  } catch {
    /* private mode */
  }
}

const SAVED_KEY = "talantly_saved_vacancies";
const APPLIED_KEY = "talantly_applied_vacancies";

export function isSavedVacancy(id: string): boolean {
  return readSet(SAVED_KEY).has(id);
}

export function toggleSavedVacancy(id: string): boolean {
  const set = readSet(SAVED_KEY);
  const now = !set.has(id);
  if (now) set.add(id);
  else set.delete(id);
  writeSet(SAVED_KEY, set);
  return now;
}

export function isAppliedVacancy(id: string): boolean {
  return readSet(APPLIED_KEY).has(id);
}

export function markAppliedVacancy(id: string): void {
  const set = readSet(APPLIED_KEY);
  set.add(id);
  writeSet(APPLIED_KEY, set);
}
