// @ts-nocheck
import { EntitySchema } from '@mikro-orm/core';

export class WalletEntity {
  id!: string;
  playerId!: string;
  currency!: string;
  balance!: string;
  version!: number;
  createdAt: Date = new Date();
  updatedAt: Date = new Date();
}

export const WalletSchema = new EntitySchema({
  class: WalletEntity,
  tableName: 'wallets',
  properties: {
    id: { type: 'uuid', primary: true },
    playerId: { type: 'uuid' },
    currency: { type: 'string', length: 3 },
    balance: { type: 'string', columnType: 'numeric(12,2)' },
    version: { type: 'number', version: true },
    createdAt: { type: 'Date', onCreate: () => new Date() },
    updatedAt: { type: 'Date', onUpdate: () => new Date() },
  },
});