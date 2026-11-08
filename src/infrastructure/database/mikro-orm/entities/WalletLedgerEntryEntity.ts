// @ts-nocheck
import { EntitySchema } from '@mikro-orm/core';
import { LedgerDirection } from '../../../../domain/models/WalletLedgerEntry';

export class WalletLedgerEntryEntity {
  id!: string;
  walletId!: string;
  transactionId!: string;
  direction!: LedgerDirection;
  moneyAmount!: string;
  moneyCurrency!: string;
  balanceBeforeAmount!: string;
  balanceBeforeCurrency!: string;
  balanceAfterAmount!: string;
  balanceAfterCurrency!: string;
  createdAt: Date = new Date();
}

export const WalletLedgerEntrySchema = new EntitySchema({
  class: WalletLedgerEntryEntity,
  tableName: 'wallet_ledger_entries',
  properties: {
    id: { type: 'uuid', primary: true },
    walletId: { type: 'uuid' },
    transactionId: { type: 'uuid' },
    direction: { type: 'string' },
    moneyAmount: { type: 'string', columnType: 'numeric(12,2)' },
    moneyCurrency: { type: 'string', length: 3 },
    balanceBeforeAmount: { type: 'string', columnType: 'numeric(12,2)' },
    balanceBeforeCurrency: { type: 'string', length: 3 },
    balanceAfterAmount: { type: 'string', columnType: 'numeric(12,2)' },
    balanceAfterCurrency: { type: 'string', length: 3 },
    createdAt: { type: 'Date' },
  },
});