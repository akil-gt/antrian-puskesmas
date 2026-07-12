export function validatePhone(value: string): boolean {
  return /^(62|0)\d{8,15}$/.test(value);
}

export function validateNIK(value: string): boolean {
  return /^\d{16}$/.test(value);
}

export function validateUsername(value: string): boolean {
  return /^[a-zA-Z0-9_]{3,30}$/.test(value);
}

export function validatePassword(value: string): boolean {
  return value.length >= 6 && value.length <= 100;
}

export function validateNama(value: string): boolean {
  return value.length >= 2 && value.length <= 100;
}
