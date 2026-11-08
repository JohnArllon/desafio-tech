"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const postgresql_1 = require("@mikro-orm/postgresql");
const WalletEntity_1 = require("./src/infrastructure/database/mikro-orm/entities/WalletEntity");
const WalletLedgerEntryEntity_1 = require("./src/infrastructure/database/mikro-orm/entities/WalletLedgerEntryEntity");
const WagerTransactionEntity_1 = require("./src/infrastructure/database/mikro-orm/entities/WagerTransactionEntity");
const InboxMessageEntity_1 = require("./src/infrastructure/database/mikro-orm/entities/InboxMessageEntity");
const OutboxMessageEntity_1 = require("./src/infrastructure/database/mikro-orm/entities/OutboxMessageEntity");
const config = {
    driver: postgresql_1.PostgreSqlDriver,
    dbName: 'wagering_db',
    user: 'jungle',
    password: 'password',
    host: 'localhost',
    port: 5432,
    entities: [
        WalletEntity_1.WalletEntity,
        WalletLedgerEntryEntity_1.WalletLedgerEntryEntity,
        WagerTransactionEntity_1.WagerTransactionEntity,
        InboxMessageEntity_1.InboxMessageEntity,
        OutboxMessageEntity_1.OutboxMessageEntity
    ],
    migrations: {
        path: './src/infrastructure/database/mikro-orm/migrations',
        disableForeignKeys: false,
    },
};
exports.default = config;
//# sourceMappingURL=mikro-orm.config.js.map