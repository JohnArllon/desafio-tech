import { WagerTransaction, WagerTransactionKind, FailureCode } from '../../../domain/models/WagerTransaction';
import { Wallet, InsufficientBalanceError } from '../../../domain/models/Wallet';
import { InboxMessage, OutboxMessage } from '../../../domain/models/InboxOutbox';
import { WalletBalanceChanged } from '../../../domain/events/WalletBalanceChanged';

export interface UnitOfWork { execute<T>(work: (ctx: unknown) => Promise<T>): Promise<T>; }
export interface IWalletRepository { findById(id: string, ctx: unknown): Promise<Wallet | null>; save(wallet: Wallet, ctx: unknown): Promise<void>; }
export interface IInboxRepository { findByIdempotencyKey(key: string, ctx: unknown): Promise<InboxMessage | null>; save(inbox: InboxMessage, ctx: unknown): Promise<void>; }
export interface IWagerRepository { findByExternalId(providerId: string, extId: string, ctx: unknown): Promise<WagerTransaction | null>; save(tx: WagerTransaction, ctx: unknown): Promise<void>; }
export interface IOutboxRepository { save(msg: OutboxMessage, ctx: unknown): Promise<void>; }
export interface ILedgerRepository { save(entry: any, ctx: unknown): Promise<void>; }

export class ProcessWagerTransactionUseCase {
  constructor(
    private readonly uow: UnitOfWork, private readonly walletRepo: IWalletRepository,
    private readonly wagerRepo: IWagerRepository, private readonly inboxRepo: IInboxRepository,
    private readonly outboxRepo: IOutboxRepository, private readonly ledgerRepo: ILedgerRepository,
  ) {}

  async execute(tx: WagerTransaction, consumerName: string): Promise<WagerTransaction> {
    // 1. Inicia transação SQL atómica[cite: 15]
    return this.uow.execute(async (ctx) => {
      
      // 2. Idempotência via Inbox[cite: 21]
      const existingInbox = await this.inboxRepo.findByIdempotencyKey(tx.idempotencyKey, ctx);
      if (existingInbox) {
        if (existingInbox.payloadHash !== tx.payloadHash) throw new Error('PayloadConflict');
        return tx; 
      }

      const inboxMsg = InboxMessage.receive({ messageId: tx.idempotencyKey, consumerName, payloadHash: tx.payloadHash, receivedAt: new Date() });

      // 3. Valida Wallet (Optimistic Locking via version[cite: 10])
      const wallet = await this.walletRepo.findById(tx.walletId, ctx);
      if (!wallet) return this.rejectAndSave(tx, FailureCode.UnknownInfrastructureError, inboxMsg, ctx);

      // 4. Referências ausentes vão para repetição[cite: 16]
      if (tx.requiresReference() && tx.referenceExternalTransactionId) {
        const ref = await this.wagerRepo.findByExternalId(tx.providerId, tx.referenceExternalTransactionId, ctx);
        if (!ref) {
          tx.markPendingReference();
          await this.wagerRepo.save(tx, ctx);
          await this.inboxRepo.save(inboxMsg, ctx);
          return tx;
        }
      }

      // 5. Altera o saldo e processa[cite: 16]
      let ledgerEntry = null;
      try {
        if (tx.kind === WagerTransactionKind.Bet) ledgerEntry = wallet.debit(tx.money, tx.id);
        else if (tx.kind === WagerTransactionKind.Win || tx.kind === WagerTransactionKind.Refund) ledgerEntry = wallet.credit(tx.money, tx.id);
        // ROLLBACK inverteria com base na referência
        
        tx.markProcessed(tx.referenceExternalTransactionId, new Date());
      } catch (error) {
        if (error instanceof InsufficientBalanceError) return this.rejectAndSave(tx, FailureCode.InsufficientFunds, inboxMsg, ctx);
        throw error;
      }

      inboxMsg.markProcessed(new Date());

      // 6. Persiste tudo no mesmo commit[cite: 23]
      await this.walletRepo.save(wallet, ctx);
      if (ledgerEntry) await this.ledgerRepo.save(ledgerEntry, ctx);
      await this.wagerRepo.save(tx, ctx);
      await this.inboxRepo.save(inboxMsg, ctx);

      // 7. Envia evento para a Outbox[cite: 24]
      if (ledgerEntry) {
        const outboxMsg = OutboxMessage.enqueue(WalletBalanceChanged.from(wallet, ledgerEntry, tx.id));
        await this.outboxRepo.save(outboxMsg, ctx);
      }

      return tx;
    });
  }

  private async rejectAndSave(tx: WagerTransaction, code: FailureCode, inbox: InboxMessage, ctx: unknown): Promise<WagerTransaction> {
    tx.reject(code);
    inbox.markProcessed(new Date());
    await this.wagerRepo.save(tx, ctx);
    await this.inboxRepo.save(inbox, ctx);
    return tx;
  }
}