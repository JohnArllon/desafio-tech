# Architecture & Technical Decisions - Distributed Wagering Processor

## 1. Stack Tecnológica e Justificativas
* **Bun & TypeScript (Strict Mode)**: Escolhidos para garantir máxima performance de execução, compilação estrita e tipagem segura em tempo de compilação.
* **NestJS**: Utilizado para estruturar a aplicação com base em inversão de controle e Clean Architecture, separando domínio, aplicação, infraestrutura e apresentação.
* **PostgreSQL & MikroORM**: O MikroORM foi selecionado pelo seu suporte nativo a `Unit of Work`, mapeamento explícito e gestão de concorrência com suporte a bloqueios.
* **Decimal.js**: Obrigatório para evitar erros de ponto flutuante (`number`/`float`), mantendo precisão monetária absoluta com escala fixa de 2 casas decimais.

## 2. Gestão de Concorrência e Integridade
* **Bloqueio Otimista (Optimistic Locking)**: Gerenciado através da propriedade de versão (`version`) na tabela `Wallet`. Garante que operações concorrentes sobre a mesma carteira detectem conflitos de versão, prevenindo *lost updates* e garantindo que apenas uma aposta seja processada com sucesso enquanto a concorrente é rejeitada por saldo insuficiente.
* **Consistência Atômica**: Alterações de saldo, inserção no `WalletLedgerEntry`, registo de `InboxMessage` e enfileiramento na `OutboxMessage` ocorrem dentro da mesma transação SQL ACID.

## 3. Idempotência e Outbox Pattern
* **Idempotência Persistente**: Baseada no cabeçalho `Idempotency-Key` e na validação de hash do payload (`payloadHash`), prevenindo duplicações e assegurando replays consistentes (`idempotentReplay: true`).
* **Transactional Outbox**: Garante consistência eventual e resiliência a falhas de infraestrutura (crash recovery), publicando eventos apenas após o commit bem-sucedido na base de dados.