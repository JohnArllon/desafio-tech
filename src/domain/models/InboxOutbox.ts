import { IntegrationEvent } from '../events/IntegrationEvent';
import { randomUUID } from 'crypto';

export interface ReceiveInboxProps {
  messageId: string; consumerName: string; payloadHash: string; receivedAt: Date;
}

export class InboxMessage {
  private constructor(
    public readonly messageId: string, public readonly consumerName: string,
    public readonly payloadHash: string, public readonly receivedAt: Date, private _processedAt?: Date,
  ) {}

  static receive(props: ReceiveInboxProps): InboxMessage {
    return new InboxMessage(props.messageId, props.consumerName, props.payloadHash, props.receivedAt);
  }

  get processedAt(): Date | undefined { return this._processedAt; }
  isProcessed(): boolean { return this._processedAt !== undefined; }
  markProcessed(at: Date): void { this._processedAt = at; }
}

export class OutboxMessage {
  private constructor(
    public readonly id: string, public readonly aggregateId: string, public readonly eventType: string,
    public readonly payload: Readonly<Record<string, unknown>>, public readonly occurredAt: Date,
    private _attempts: number, private _nextAttemptAt?: Date, private _publishedAt?: Date,
  ) {}

  static enqueue(event: IntegrationEvent<unknown>): OutboxMessage {
    return new OutboxMessage(
      randomUUID(), event.aggregateId, event.eventType,
      event.toJSON() as Record<string, unknown>, event.occurredAt, 0, new Date(),
    );
  }
}