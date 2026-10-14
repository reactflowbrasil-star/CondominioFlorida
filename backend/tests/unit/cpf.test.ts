import { normalizeCpf, isValidCpfFormat, formatCpf } from '../../src/utils/cpf.js';

describe('CPF Utilities', () => {
  describe('normalizeCpf', () => {
    it('should remove non-digit characters', () => {
      expect(normalizeCpf('123.456.789-09')).toBe('12345678909');
      expect(normalizeCpf('12345678909')).toBe('12345678909');
      expect(normalizeCpf('123-456-789-09')).toBe('12345678909');
    });
  });

  describe('isValidCpfFormat', () => {
    it('should validate a valid CPF', () => {
      expect(isValidCpfFormat('52998224725')).toBe(true);
      expect(isValidCpfFormat('123.456.789-09')).toBe(true);
    });

    it('should reject an invalid CPF with wrong check digits', () => {
      expect(isValidCpfFormat('12345678901')).toBe(false);
    });

    it('should reject CPF with all same digits', () => {
      expect(isValidCpfFormat('11111111111')).toBe(false);
      expect(isValidCpfFormat('00000000000')).toBe(false);
    });

    it('should reject CPF with wrong length', () => {
      expect(isValidCpfFormat('123456789')).toBe(false);
      expect(isValidCpfFormat('123456789012')).toBe(false);
    });
  });

  describe('formatCpf', () => {
    it('should format CPF correctly', () => {
      expect(formatCpf('12345678909')).toBe('123.456.789-09');
      expect(formatCpf('52998224725')).toBe('529.982.247-25');
    });
  });
});
