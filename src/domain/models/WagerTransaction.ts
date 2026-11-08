import { Money } from './Money';
import { LedgerDirection } from './WalletLedgerEntry';

export enum WagerTransactionKind {
  Opening = 'OPENING', // interno: crédito de abertura da wallet[cite: 11]
  Bet = 'BET',
  Win = 'WIN',
  Loss = 'LOSS',
  Refund = 'REFUND',
  Rollback = 'ROLLBACK',
}

export enum WagerTransactionStatus {
  PendingReference = 'PENDING_REFERENCE',
  Pending = 'PENDING',
  Processed = 'PROCESSED',
  Rejected = 'REJECTED',
  Failed = 'FAILED',
}

// Taxonomia de erros exigida para devolver ao provedor[cite: 17]
export enum FailureCode {
  InsufficientFunds = 'INSUFFICIENT_FUNDS',
  ReferenceNotFound = 'REFERENCE_NOT_FOUND',
  AlreadyReverted = 'ALREADY_REVERTED',
  NegativeBalanceReversal = 'NEGATIVE_BALANCE_REVERSAL',
  PayloadConflict = 'PAYLOAD_CONFLICT',
  UnknownInfrastructureError = 'UNKNOWN_INFRASTRUCTURE_ERROR',
}

export interface CreateWagerTransactionProps {
  id: string;
  providerId: string;
  externalTransactionId: string;
  idempotencyKey: string;
  payloadHash: string;
  walletId: string;
  playerId: string;
  roundId: string;
  gameId: string;
  kind: WagerTransactionKind;
  money: Money;
  referenceExternalTransactionId?: string;
  createdAt: Date;
}

export interface WagerTransactionState extends CreateWagerTransactionProps {
  status: WagerTransactionStatus;
  referenceTransactionId?: string;
  failureCode?: FailureCode;
  processedAt?: Date;
}

export class InvalidTransactionStateError extends Error {
  constructor(currentStatus: string, attempt: string) {
    super(`Cannot ${attempt} a transaction in terminal state: ${currentStatus}`);
    this.name = 'InvalidTransactionStateError';
  }
}

export class WagerTransaction {
  private constructor(
    public readonly id: string,
    public readonly providerId: string,
    public readonly externalTransactionId: string,
    public readonly idempotencyKey: string,
    public readonly payloadHash: string,
    public readonly walletId: string,
    public readonly playerId: string,
    public readonly roundId: string,
    public readonly gameId: string,
    public readonly kind: WagerTransactionKind,
    public readonly money: Money,
    public readonly referenceExternalTransactionId: string | undefined,
    public readonly createdAt: Date,
    private _status: WagerTransactionStatus,
    private _referenceTransactionId?: string,
    private _failureCode?: FailureCode,
    private _processedAt?: Date,
  ) {}

  static create(props: CreateWagerTransactionProps): WagerTransaction {
    // Valida a exigência de referência[cite: 12]
    const status = 
      (props.kind === WagerTransactionKind.Refund || props.kind === WagerTransactionKind.Rollback) && !props.referenceExternalTransactionId
        ? WagerTransactionStatus.PendingReference 
        : WagerTransactionStatus.Pending;

    return new WagerTransaction(
      props.id, props.providerId, props.externalTransactionId, props.idempotencyKey, props.payloadHash,
      props.walletId, props.playerId, props.roundId, props.gameId, props.kind, props.money,
      props.referenceExternalTransactionId, props.createdAt, status,
    );
  }

  static rehydrate(state: WagerTransactionState): WagerTransaction {
    return new WagerTransaction(
      state.id, state.providerId, state.externalTransactionId, state.idempotencyKey, state.payloadHash,
      state.walletId, state.playerId, state.roundId, state.gameId, state.kind, state.money,
      state.referenceExternalTransactionId, state.createdAt, state.status, state.referenceTransactionId,
      state.failureCode, state.processedAt,
    );
  }

  get status(): WagerTransactionStatus { return this._status; }
  get referenceTransactionId(): string | undefined { return this._referenceTransactionId; }
  get failureCode(): FailureCode | undefined { return this._failureCode; }
  get processedAt(): Date | undefined { return this._processedAt; }

  markProcessed(referenceTransactionId: string | undefined, at: Date): void {
    this.assertNotTerminal('markProcessed');
    this._status = WagerTransactionStatus.Processed;
    this._referenceTransactionId = referenceTransactionId;
    this._processedAt = at;
  }

  markPendingReference(): void {
    this.assertNotTerminal('markPendingReference');
    this._status = WagerTransactionStatus.PendingReference;
  }

  reject(code: FailureCode): void {
    this.assertNotTerminal('reject');
    this._status = WagerTransactionStatus.Rejected;
    this._failureCode = code;
  }

  fail(code: FailureCode): void {
    this.assertNotTerminal('fail');
    this._status = WagerTransactionStatus.Failed;
    this._failureCode = code;
  }

  isTerminal(): boolean {
    // PROCESSED, REJECTED e FAILED são terminais[cite: 12]
    return [WagerTransactionStatus.Processed, WagerTransactionStatus.Rejected, WagerTransactionStatus.Failed].includes(this._status);
  }

  affectsBalance(): boolean {
    // LOSS não afeta saldo[cite: 12]
    return this.kind !== WagerTransactionKind.Loss;
  }

  requiresReference(): boolean {
    // true para REFUND e ROLLBACK[cite: 12]
    return this.kind === WagerTransactionKind.Refund || this.kind === WagerTransactionKind.Rollback;
  }

  ledgerDirectionFor(reference?: WagerTransaction): LedgerDirection {
    if (this.kind === WagerTransactionKind.Bet) return LedgerDirection.Debit; // 1 entrada DEBIT[cite: 16]
    if (this.kind === WagerTransactionKind.Win || this.kind === WagerTransactionKind.Refund || this.kind === WagerTransactionKind.Opening) return LedgerDirection.Credit; // 1 entrada CREDIT[cite: 16]
    
    if (this.kind === WagerTransactionKind.Rollback) {
      if (!reference) throw new Error('ROLLBACK requires reference');
      // 1 entrada invertida[cite: 16]
      return reference.ledgerDirectionFor() === LedgerDirection.Credit ? LedgerDirection.Debit : LedgerDirection.Credit;
    }
    throw new Error('LOSS does not affect ledger');
  }

  private assertNotTerminal(attempt: string): void {
    if (this.isTerminal()) throw new InvalidTransactionStateError(this._status, attempt);
  }
}