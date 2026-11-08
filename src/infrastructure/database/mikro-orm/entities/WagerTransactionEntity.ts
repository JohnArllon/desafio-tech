// @ts-nocheck
import { EntitySchema } from '@mikro-orm/core';
import { WagerTransactionKind, WagerTransactionStatus, FailureCode } from '../../../../domain/models/WagerTransaction';

export class WagerTransactionEntity {
  id!: string;
  providerId!: string;
  externalTransactionId!: string;
  idempotencyKey!: string;
  payloadHash!: string;
  walletId!: string;
  playerId!: string;
  roundId!: string;
  gameId!: string;
  kind!: WagerTransactionKind;
  moneyAmount!: string;
  moneyCurrency!: string;
  referenceExternalTransactionId?: string;
  status!: WagerTransactionStatus;
  referenceTransactionId?: string;
  failureCode?: FailureCode;
  createdAt: Date = new Date();
  processedAt?: Date;
}

export const WagerTransactionSchema = new EntitySchema({
  class: WagerTransactionEntity,
  tableName: 'wager_transactions',
  properties: {
    id: { type: 'uuid', primary: true },
    providerId: { type: 'string' },
    externalTransactionId: { type: 'string' },
    idempotencyKey: { type: 'string', unique: true },
    payloadHash: { type: 'string' },
    walletId: { type: 'uuid' },
    playerId: { type: 'uuid' },
    roundId: { type: 'string' },
    gameId: { type: 'string' },
    kind: { type: 'string' },
    moneyAmount: { type: 'string', columnType: 'numeric(12,2)' },
    moneyCurrency: { type: 'string', length: 3 },
    referenceExternalTransactionId: { type: 'string', nullable: true },
    status: { type: 'string' },
    referenceTransactionId: { type: 'string', nullable: true },
    failureCode: { type: 'string', nullable: true },
    createdAt: { type: 'Date' },
    processedAt: { type: 'Date', nullable: true },
  },
});