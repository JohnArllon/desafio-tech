// @ts-nocheck
import { EntitySchema } from '@mikro-orm/core';

export class InboxMessageEntity {
  messageId!: string;
  consumerName!: string;
  payloadHash!: string;
  receivedAt: Date = new Date();
  processedAt?: Date;
}

export const InboxMessageSchema = new EntitySchema({
  class: InboxMessageEntity,
  tableName: 'inbox_messages',
  properties: {
    messageId: { type: 'string', primary: true },
    consumerName: { type: 'string' },
    payloadHash: { type: 'string' },
    receivedAt: { type: 'Date' },
    processedAt: { type: 'Date', nullable: true },
  },
});