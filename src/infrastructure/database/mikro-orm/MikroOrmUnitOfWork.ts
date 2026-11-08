import { Injectable } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/postgresql';
import { UnitOfWork } from '../../../application/use-cases/process-wager/ProcessWagerTransactionUseCase';

@Injectable()
export class MikroOrmUnitOfWork implements UnitOfWork {
  constructor(private readonly em: EntityManager) {}

  async execute<T>(work: (ctx: EntityManager) => Promise<T>): Promise<T> {
    // Abre a transação atómica e repassa o contexto[cite: 4, 23]
    return this.em.transactional(async (ctx) => {
      return work(ctx);
    });
  }
}