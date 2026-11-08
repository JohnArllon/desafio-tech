import { Money, CurrencyMismatchError } from './Money';
import { WalletLedgerEntry, LedgerDirection } from './WalletLedgerEntry';
import { randomUUID } from 'crypto';

export interface WalletState {
  id: string;
  playerId: string;
  currency: string;
  balance: Money;
  version: number;
  createdAt: Date;
  updatedAt: Date;
}

export class InsufficientBalanceError extends Error {
  constructor() {
    super('Insufficient balance for this operation');
    this.name = 'InsufficientBalanceError';
  }
}

export class Wallet {
  private constructor(
    public readonly id: string,
    public readonly playerId: string,
    public readonly currency: string,
    private _balance: Money,
    private _version: number,
    public readonly createdAt: Date,
    private _updatedAt: Date,
  ) {}

  static open(props: { id: string; playerId: string; initialBalance: Money }): Wallet {
    const now = new Date();
    // A versão inicia em 1 após a criação[cite: 10]
    return new Wallet(props.id, props.playerId, props.initialBalance.currency, props.initialBalance, 1, now, now);
  }

  static rehydrate(state: WalletState): Wallet {
    return new Wallet(state.id, state.playerId, state.currency, state.balance, state.version, state.createdAt, state.updatedAt);
  }

  get balance(): Money { return this._balance; }
  get version(): number { return this._version; }
  get updatedAt(): Date { return this._updatedAt; }

  credit(money: Money, transactionId: string): WalletLedgerEntry {
    this.assertSameCurrency(money);
    
    const balanceBefore = this._balance;
    this._balance = this._balance.add(money);
    this.incrementVersion();

    return WalletLedgerEntry.create({
      id: randomUUID(), walletId: this.id, transactionId, direction: LedgerDirection.Credit,
      money, balanceBefore, balanceAfter: this._balance, createdAt: new Date(),
    });
  }

  debit(money: Money, transactionId: string): WalletLedgerEntry {
    this.assertSameCurrency(money);

    // Garante a invariante: saldo nunca negativo[cite: 10]
    if (this._balance.isLessThan(money)) {
      throw new InsufficientBalanceError();
    }

    const balanceBefore = this._balance;
    this._balance = this._balance.subtract(money);
    this.incrementVersion();

    return WalletLedgerEntry.create({
      id: randomUUID(), walletId: this.id, transactionId, direction: LedgerDirection.Debit,
      money, balanceBefore, balanceAfter: this._balance, createdAt: new Date(),
    });
  }

  private incrementVersion(): void {
    // Incrementa somente quando o saldo muda[cite: 10]
    this._version += 1;
    this._updatedAt = new Date();
  }

  private assertSameCurrency(money: Money): void {
    if (this.currency !== money.currency) {
      throw new CurrencyMismatchError(this.currency, money.currency);
    }
  }
}