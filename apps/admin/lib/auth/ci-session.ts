export const CI_SESSION_VALUE_PATTERN = /^[A-Za-z0-9,-]{20,128}$/;

export function isValidCiSessionValue(value: string): boolean {
  if (!value || value.length < 20 || value.length > 128) {
    return false;
  }
  return CI_SESSION_VALUE_PATTERN.test(value);
}

export function assertCiSessionValue(value: string): string {
  if (!isValidCiSessionValue(value)) {
    throw new Error("Valeur ci_session invalide.");
  }
  return value;
}