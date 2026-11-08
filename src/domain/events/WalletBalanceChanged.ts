import { IntegrationEvent } from './IntegrationEvent';
import { MoneyProps } from '../models/Money';
import { LedgerDirection } from '../models/WalletLedgerEntry';
import { Wallet } from '../models/Wallet';
import { WalletLedgerEntry } from '../models/WalletLedgerEntry';
import { randomUUID } from 'crypto';

export interface WalletBalanceChangedData {
  walletId: string; transactionId: string; direction: LedgerDirection;
  money: MoneyProps; balanceBefore: MoneyProps; balanceAfter: MoneyProps; walletVersion: number;
}

export class WalletBalanceChanged extends IntegrationEvent<WalletBalanceChangedData> {
  readonly eventType = 'WalletBalanceChanged';
  readonly version = 1;

  static from(wallet: Wallet, entry: WalletLedgerEntry, causationId?: string): WalletBalanceChanged {
    return new WalletBalanceChanged({
      eventId: randomUUID(), aggregateId: wallet.id, correlationId: wallet.playerId,
      causationId, occurredAt: new Date(),
      data: {
        walletId: wallet.id, transactionId: entry.transactionId, direction: entry.direction,
        money: entry.money.toJSON(), balanceBefore: entry.balanceBefore.toJSON(),
        balanceAfter: entry.balanceAfter.toJSON(), walletVersion: wallet.version,
      },
    });
  }
}