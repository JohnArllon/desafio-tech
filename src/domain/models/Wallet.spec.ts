import { describe, it, expect } from 'bun:test';
import { Wallet, InsufficientBalanceError } from './Wallet';
import { Money, CurrencyMismatchError } from './Money';
import { LedgerDirection } from './WalletLedgerEntry';

describe('Wallet Aggregate Root', () => {
  const playerId = 'player-123';
  const walletId = 'wallet-123';
  const txId = 'tx-456';

  it('deve creditar o saldo, incrementar a versão e retornar um CREDIT ledger entry', () => {
    const wallet = Wallet.open({ id: walletId, playerId, initialBalance: Money.from({ amount: '100.00', currency: 'BRL' }) });
    const entry = wallet.credit(Money.from({ amount: '50.00', currency: 'BRL' }), txId);

    expect(wallet.balance.toString()).toBe('150.00');
    expect(wallet.version).toBe(2);
    expect(entry.direction).toBe(LedgerDirection.Credit);
    expect(entry.balanceAfter.toString()).toBe('150.00');
  });

  it('deve debitar o saldo, incrementar a versão e retornar um DEBIT ledger entry', () => {
    const wallet = Wallet.open({ id: walletId, playerId, initialBalance: Money.from({ amount: '100.00', currency: 'BRL' }) });
    const entry = wallet.debit(Money.from({ amount: '80.00', currency: 'BRL' }), txId);

    expect(wallet.balance.toString()).toBe('20.00');
    expect(wallet.version).toBe(2);
    expect(entry.direction).toBe(LedgerDirection.Debit);
  });

  it('deve lançar erro ao tentar debitar além do saldo, mantendo a versão inalterada', () => {
    const wallet = Wallet.open({ id: walletId, playerId, initialBalance: Money.from({ amount: '10.00', currency: 'BRL' }) });
    
    expect(() => wallet.debit(Money.from({ amount: '20.00', currency: 'BRL' }), txId)).toThrow(InsufficientBalanceError);
    expect(wallet.version).toBe(1);
    expect(wallet.balance.toString()).toBe('10.00');
  });

  it('deve lançar erro ao operar com moeda diferente', () => {
    const wallet = Wallet.open({ id: walletId, playerId, initialBalance: Money.from({ amount: '100.00', currency: 'BRL' }) });
    expect(() => wallet.credit(Money.from({ amount: '50.00', currency: 'USD' }), txId)).toThrow(CurrencyMismatchError);
  });
});