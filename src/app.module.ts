import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { WageringController } from './presentation/http/controllers/WageringController';
import { HealthController } from './presentation/http/controllers/HealthController'; // 1. Importado
import { ProcessWagerTransactionUseCase } from './application/use-cases/process-wager/ProcessWagerTransactionUseCase';
import { MikroOrmUnitOfWork } from './infrastructure/database/mikro-orm/MikroOrmUnitOfWork';
import config from './mikro-orm.config';
import { Wallet } from './domain/models/Wallet';
import { Money } from './domain/models/Money';

// Mock que retorna uma instância real do Agregado Wallet do Domínio
const MockRepo = { 
  findById: async () => Wallet.open({ 
    id: 'wallet-123', 
    playerId: 'player-123', 
    initialBalance: Money.from({ amount: '100.00', currency: 'BRL' }) 
  }), 
  save: async () => {}, 
  findByIdempotencyKey: async () => null, 
  findByExternalId: async () => null 
};

@Module({
  imports: [
    MikroOrmModule.forRoot(config),
  ],
  controllers: [
    WageringController,
    HealthController // 2. Registado nos controladores
  ],
  providers: [
    { provide: 'UnitOfWork', useClass: MikroOrmUnitOfWork },
    { provide: 'IWalletRepository', useValue: MockRepo },
    { provide: 'IWagerRepository', useValue: MockRepo },
    { provide: 'IInboxRepository', useValue: MockRepo },
    { provide: 'IOutboxRepository', useValue: MockRepo },
    { provide: 'ILedgerRepository', useValue: MockRepo },
    {
      provide: 'ProcessWagerTransactionUseCase',
      useFactory: (uow, walletRepo, wagerRepo, inboxRepo, outboxRepo, ledgerRepo) => {
        return new ProcessWagerTransactionUseCase(uow, walletRepo, wagerRepo, inboxRepo, outboxRepo, ledgerRepo);
      },
      inject: ['UnitOfWork', 'IWalletRepository', 'IWagerRepository', 'IInboxRepository', 'IOutboxRepository', 'ILedgerRepository'],
    },
  ],
})
export class AppModule {}