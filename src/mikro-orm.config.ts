import { defineConfig } from '@mikro-orm/postgresql';
import { WalletSchema } from './infrastructure/database/mikro-orm/entities/WalletEntity';
import { WalletLedgerEntrySchema } from './infrastructure/database/mikro-orm/entities/WalletLedgerEntryEntity';
import { WagerTransactionSchema } from './infrastructure/database/mikro-orm/entities/WagerTransactionEntity';
import { InboxMessageSchema } from './infrastructure/database/mikro-orm/entities/InboxMessageEntity';
import { OutboxMessageSchema } from './infrastructure/database/mikro-orm/entities/OutboxMessageEntity';

export default defineConfig({
  dbName: 'wagering_db',
  user: 'jungle',
  password: 'password',
  host: 'localhost',
  port: 5432,
  entities: [WalletSchema, WalletLedgerEntrySchema, WagerTransactionSchema, InboxMessageSchema, OutboxMessageSchema],
});