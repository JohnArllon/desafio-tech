// @ts-nocheck
import { EntitySchema } from '@mikro-orm/core';

export class OutboxMessageEntity {
  id!: string;
  aggregateId!: string;
  eventType!: string;
  payload!: any;
  occurredAt: Date = new Date();
  attempts: number = 0;
  nextAttemptAt?: Date;
  publishedAt?: Date;
}

export const OutboxMessageSchema = new EntitySchema({
  class: OutboxMessageEntity,
  tableName: 'outbox_messages',
  properties: {
    id: { type: 'uuid', primary: true },
    aggregateId: { type: 'string' },
    eventType: { type: 'string' },
    payload: { type: 'json' },
    occurredAt: { type: 'Date' },
    attempts: { type: 'number', default: 0 },
    nextAttemptAt: { type: 'Date', nullable: true },
    publishedAt: { type: 'Date', nullable: true },
  },
});