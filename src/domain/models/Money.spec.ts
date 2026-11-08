import { describe, it, expect } from 'bun:test';
import { Money, InvalidMoneyInputError, CurrencyMismatchError } from './Money';

describe('Money Value Object', () => {
  describe('Instanciação e Validação', () => {
    it('deve criar uma instância a partir de uma string válida com 2 casas decimais', () => {
      const money = Money.from({ amount: '25.00', currency: 'BRL' });
      expect(money.toString()).toBe('25.00');
      expect(money.currency).toBe('BRL');
    });

    it('deve criar uma instância zero', () => {
      const zero = Money.zero('BRL');
      expect(zero.toString()).toBe('0.00');
      expect(zero.isZero()).toBe(true);
    });

    it('deve rejeitar valores com mais ou menos de 2 casas decimais', () => {
      expect(() => Money.from({ amount: '25.0', currency: 'BRL' })).toThrow(InvalidMoneyInputError);
      expect(() => Money.from({ amount: '25', currency: 'BRL' })).toThrow(InvalidMoneyInputError);
      expect(() => Money.from({ amount: '25.000', currency: 'BRL' })).toThrow(InvalidMoneyInputError);
    });

    it('deve rejeitar valores negativos em contratos de entrada', () => {
      expect(() => Money.from({ amount: '-25.00', currency: 'BRL' })).toThrow(InvalidMoneyInputError);
    });
  });

  describe('Operações Matemáticas e Imutabilidade', () => {
    it('deve somar dois valores retornando uma nova instância', () => {
      const m1 = Money.from({ amount: '10.50', currency: 'BRL' });
      const m2 = Money.from({ amount: '20.25', currency: 'BRL' });
      const result = m1.add(m2);

      expect(result.toString()).toBe('30.75');
      expect(result).not.toBe(m1); // Garante imutabilidade
    });

    it('deve subtrair dois valores corretamente', () => {
      const m1 = Money.from({ amount: '30.00', currency: 'BRL' });
      const m2 = Money.from({ amount: '10.50', currency: 'BRL' });
      const result = m1.subtract(m2);

      expect(result.toString()).toBe('19.50');
    });
  });

  describe('Comparações e Regras de Moeda', () => {
    it('deve lançar erro ao operar com moedas diferentes', () => {
      const brl = Money.from({ amount: '10.00', currency: 'BRL' });
      const usd = Money.from({ amount: '10.00', currency: 'USD' });

      expect(() => brl.add(usd)).toThrow(CurrencyMismatchError);
    });

    it('deve comparar valores corretamente', () => {
      const m1 = Money.from({ amount: '10.00', currency: 'BRL' });
      const m2 = Money.from({ amount: '20.00', currency: 'BRL' });

      expect(m1.isLessThan(m2)).toBe(true);
      expect(m2.isLessThan(m1)).toBe(false);
    });
  });
});