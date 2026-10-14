export function normalizeCpf(cpf: string): string {
  return cpf.replace(/\D/g, '');
}

export function isValidCpfFormat(cpf: string): boolean {
  const normalized = normalizeCpf(cpf);
  if (normalized.length !== 11) return false;
  if (normalized === '00000000000' || normalized === '11111111111' || normalized === '22222222222' ||
      normalized === '33333333333' || normalized === '44444444444' || normalized === '55555555555' ||
      normalized === '66666666666' || normalized === '77777777777' || normalized === '88888888888' || normalized === '99999999999') {
    return false;
  }
  let sum = 0;
  for (let i = 1; i <= 9; i++) sum += parseInt(normalized.charAt(i - 1)) * (11 - i);
  let remainder = (sum * 10) % 11;
  if (remainder === 10) remainder = 0;
  if (parseInt(normalized.charAt(9)) !== remainder) return false;
  sum = 0;
  for (let i = 1; i <= 10; i++) sum += parseInt(normalized.charAt(i - 1)) * (12 - i);
  remainder = (sum * 10) % 11;
  if (remainder === 10) remainder = 0;
  if (parseInt(normalized.charAt(10)) !== remainder) return false;
  return true;
}

export function formatCpf(cpf: string): string {
  const normalized = normalizeCpf(cpf);
  if (normalized.length !== 11) return cpf;
  return normalized.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
}
