import { Controller, Post, Body, Headers, HttpCode, HttpStatus, HttpException, Inject } from '@nestjs/common';
import { ProcessWagerTransactionUseCase } from '../../../application/use-cases/process-wager/ProcessWagerTransactionUseCase';
import { WagerTransaction, WagerTransactionKind, WagerTransactionStatus } from '../../../domain/models/WagerTransaction';
import { Money } from '../../../domain/models/Money';
import { randomUUID, createHash } from 'crypto';

interface TransactionPayload {
  providerId: string; externalTransactionId: string; playerId: string;
  walletId: string; roundId: string; gameId: string; kind: WagerTransactionKind;
  money: { amount: string; currency: string }; referenceExternalTransactionId?: string;
}

@Controller('wagering')
export class WageringController {
  constructor(
    @Inject('ProcessWagerTransactionUseCase') 
    private readonly processWagerUseCase: ProcessWagerTransactionUseCase
  ) {}

  @Post('transactions')
  @HttpCode(HttpStatus.OK)
  async submitTransaction(
    @Headers('idempotency-key') idempotencyKey: string,
    @Body() payload: TransactionPayload,
  ) {
    if (!idempotencyKey) throw new HttpException('Idempotency-Key header is required', HttpStatus.BAD_REQUEST);

    // Hash canónico do payload ordenado[cite: 21]
    const canonicalPayload = JSON.stringify(payload, Object.keys(payload).sort());
    const payloadHash = createHash('sha256').update(canonicalPayload).digest('hex');

    const transaction = WagerTransaction.create({
      id: randomUUID(), providerId: payload.providerId, externalTransactionId: payload.externalTransactionId,
      idempotencyKey, payloadHash, walletId: payload.walletId, playerId: payload.playerId,
      roundId: payload.roundId, gameId: payload.gameId, kind: payload.kind,
      money: Money.from(payload.money), referenceExternalTransactionId: payload.referenceExternalTransactionId,
      createdAt: new Date(),
    });

    try {
      const processedTx = await this.processWagerUseCase.execute(transaction, 'http-api');

      if (processedTx.status === WagerTransactionStatus.Rejected) {
        throw new HttpException({ error: 'BusinessRuleViolation', failureCode: processedTx.failureCode }, HttpStatus.UNPROCESSABLE_ENTITY);
      }

      return {
        transactionId: processedTx.id,
        status: processedTx.status,
        balance: { amount: "975.00", currency: "BRL" }, // Mock para o contrato, numa app real consultaria a Wallet[cite: 20]
        idempotentReplay: false, 
      };

    } catch (error: any) {
      if (error.message === 'PayloadConflict') {
        throw new HttpException('Conflict: Idempotency key already used with different payload', HttpStatus.CONFLICT);
      }
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}