import { Decimal } from 'decimal.js';

export interface MoneyProps {
  amount: string; // decimal string, ex.: "25.00"[cite: 7]
  currency: string; // ISO-4217[cite: 7]
}

export class InvalidMoneyInputError extends Error {
  constructor(message: string) {
    super(`Invalid Money Input: ${message}`);
    this.name = 'InvalidMoneyInputError';
  }
}

export class CurrencyMismatchError extends Error {
  constructor(currencyA: string, currencyB: string) {
    super(`Currency mismatch: cannot operate on ${currencyA} and ${currencyB}`);
    this.name = 'CurrencyMismatchError';
  }
}

export class Money {
  private constructor(
    private readonly value: Decimal,
    public readonly currency: string,
  ) {}

  static from(props: MoneyProps): Money {
    if (!props.amount || typeof props.amount !== 'string') {
      throw new InvalidMoneyInputError('Amount must be a string');
    }

    // Regra: rejeita string vazia, notação científica e garante escala fixa de 2 casas decimais[cite: 8]
    const strictFormatRegex = /^\d+\.\d{2}$/; 
    if (!strictFormatRegex.test(props.amount)) {
      throw new InvalidMoneyInputError('Amount must be a positive decimal string with exactly 2 decimal places (e.g., "25.00")');
    }

    const dec = new Decimal(props.amount);
    
    if (dec.isNaN() || !dec.isFinite()) {
      throw new InvalidMoneyInputError('Amount must be a finite number');
    }

    return new Money(dec, props.currency.toUpperCase());
  }

  static zero(currency: string): Money {
    return new Money(new Decimal('0.00'), currency.toUpperCase());
  }

  add(other: Money): Money {
    this.assertSameCurrency(other);
    // money é imutável: toda operação retorna uma nova instância[cite: 8]
    return new Money(this.value.plus(other.value), this.currency);
  }

  subtract(other: Money): Money {
    this.assertSameCurrency(other);
    return new Money(this.value.minus(other.value), this.currency);
  }

  negate(): Money {
    return new Money(this.value.negated(), this.currency);
  }

  isZero(): boolean {
    return this.value.isZero();
  }

  isPositive(): boolean {
    return this.value.isPositive() && !this.isZero();
  }

  isNegative(): boolean {
    return this.value.isNegative();
  }

  isLessThan(other: Money): boolean {
    this.assertSameCurrency(other);
    return this.value.lessThan(other.value);
  }

  equals(other: Money): boolean {
    if (this.currency !== other.currency) return false;
    return this.value.equals(other.value);
  }

  toJSON(): MoneyProps {
    return {
      amount: this.toString(),
      currency: this.currency,
    };
  }

  toString(): string {
    return this.value.toFixed(2); 
  }

  private assertSameCurrency(other: Money): void {
    if (this.currency !== other.currency) {
      throw new CurrencyMismatchError(this.currency, other.currency);
    }
  }
}