export function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

export function validatePassword(password: string): boolean {
  return password.length >= 12 && password.length <= 128;
}

export function validateOrganizationName(name: string): boolean {
  const length = name.trim().length;
  return length >= 2 && length <= 120;
}
