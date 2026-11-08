import { Money } from './Money';

export enum LedgerDirection {
  Debit = 'DEBIT',
  Credit = 'CREDIT',
}

export interface CreateLedgerEntryProps {
  id: string;
  walletId: string;
  transactionId: string;
  direction: LedgerDirection;
  money: Money;
  balanceBefore: Money;
  balanceAfter: Money;
  createdAt: Date;
}

export interface LedgerEntryState extends CreateLedgerEntryProps {}

export class InvalidLedgerMathError extends Error {
  constructor() {
    super('Ledger math is invalid: balanceBefore +/- money does not equal balanceAfter');
    this.name = 'InvalidLedgerMathError';
  }
}

export class WalletLedgerEntry {
  private constructor(
    public readonly id: string,
    public readonly walletId: string,
    public readonly transactionId: string,
    public readonly direction: LedgerDirection,
    public readonly money: Money,
    public readonly balanceBefore: Money,
    public readonly balanceAfter: Money,
    public readonly createdAt: Date,
  ) {}

  static create(props: CreateLedgerEntryProps): WalletLedgerEntry {
    const { direction, money, balanceBefore, balanceAfter } = props;

    // Valida a aritmética: a imutabilidade é estrutural[cite: 13]
    const expectedAfter =
      direction === LedgerDirection.Credit
        ? balanceBefore.add(money)
        : balanceBefore.subtract(money);

    if (!balanceAfter.equals(expectedAfter)) {
      throw new InvalidLedgerMathError();
    }

    return new WalletLedgerEntry(
      props.id, props.walletId, props.transactionId, props.direction,
      props.money, props.balanceBefore, props.balanceAfter, props.createdAt,
    );
  }

  static rehydrate(state: LedgerEntryState): WalletLedgerEntry {
    return new WalletLedgerEntry(
      state.id, state.walletId, state.transactionId, state.direction,
      state.money, state.balanceBefore, state.balanceAfter, state.createdAt,
    );
  }
}