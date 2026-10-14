export function normalizeCpf(cpf: string): string {
  return cpf.replace(/\D/g, '');
}
export function formatCpf(cpf: string): string {
  const normalized = normalizeCpf(cpf);
  if (normalized.length !== 11) return cpf;
  return normalized.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
}
export function isValidCpf(cpf: string): boolean {
  const normalized = normalizeCpf(cpf);
  if (normalized.length !== 11) return false;
  return true;
}
