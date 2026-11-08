import { describe, it, expect } from 'bun:test';
import { WagerTransaction, WagerTransactionKind, WagerTransactionStatus, FailureCode, InvalidTransactionStateError } from './WagerTransaction';
import { Money } from './Money';
import { LedgerDirection } from './WalletLedgerEntry';
import { randomUUID } from 'crypto';

describe('WagerTransaction Entity', () => {
  const baseProps = {
    id: randomUUID(), providerId: 'provider-a', externalTransactionId: 'tx-123',
    idempotencyKey: 'key-123', payloadHash: 'hash', walletId: randomUUID(),
    playerId: randomUUID(), roundId: 'round-1', gameId: 'game-1',
    money: Money.from({ amount: '25.00', currency: 'BRL' }), createdAt: new Date(),
  };

  it('deve criar uma transação BET no estado PENDING e validar a direção do ledger (DEBIT)', () => {
    const tx = WagerTransaction.create({ ...baseProps, kind: WagerTransactionKind.Bet });
    expect(tx.status).toBe(WagerTransactionStatus.Pending);
    expect(tx.ledgerDirectionFor()).toBe(LedgerDirection.Debit);
  });

  it('deve criar REFUND sem referência no estado PENDING_REFERENCE', () => {
    const tx = WagerTransaction.create({ ...baseProps, kind: WagerTransactionKind.Refund });
    expect(tx.status).toBe(WagerTransactionStatus.PendingReference);
    expect(tx.requiresReference()).toBe(true);
  });

  it('deve impedir transições de estado após a transação ser PROCESSED (Terminal)', () => {
    const tx = WagerTransaction.create({ ...baseProps, kind: WagerTransactionKind.Bet });
    tx.markProcessed(undefined, new Date());

    expect(tx.isTerminal()).toBe(true);
    expect(() => tx.reject(FailureCode.InsufficientFunds)).toThrow(InvalidTransactionStateError);
  });

  it('deve transitar para REJECTED e guardar o código de falha', () => {
    const tx = WagerTransaction.create({ ...baseProps, kind: WagerTransactionKind.Bet });
    tx.reject(FailureCode.InsufficientFunds);

    expect(tx.status).toBe(WagerTransactionStatus.Rejected);
    expect(tx.failureCode).toBe(FailureCode.InsufficientFunds);
  });
});