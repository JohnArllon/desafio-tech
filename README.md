# 🚀 High-Concurrency Financial Wagering System

Sistema de apostas financeiras de alta concorrência e consistência estrita, desenvolvido em **NestJS** utilizando o runtime **Bun**, **TypeScript**, **Domain-Driven Design (DDD)** e **PostgreSQL (MikroORM)**.

## 🛠️ Stack Tecnológica
* **Runtime**: [Bun v1.4+](#) (Performance nativa e testes ultrarrápidos)
* **Framework**: NestJS (CJS / Clean Architecture)
* **ORM**: MikroORM v7 (Code-First & EntitySchema)
* **Base de Dados**: PostgreSQL (com suporte a concorrência otimista e tipos `numeric`)
* **Precisão Financeira**: `decimal.js` (Isenção total de erros de ponto flutuante)

## 🏛️ Arquitetura e Decisões de Design
1. **Domínio Rico (DDD)**: As regras financeiras, validações de saldo e transições de estado (`WagerTransaction`, `Wallet`, `Money`) estão isoladas de frameworks externos.
2. **Precisão Monetária**: Valores monetários utilizam `decimal.js` com escala fixa de 2 casas decimais e validação estrita de moeda.
3. **Concorrência Otimista**: Implementado via versão (`version: true`) no MikroORM para prevenir condições de corrida (*race conditions*) em apostas simultâneas.
4. **Idempotência**: Garantida através de chaves únicas e padrões de Inbox/Outbox para evitar processamento duplicado de requisições de provedores.

---

## ⚙️ Como Executar o Projeto

### Pré-requisitos
* [Bun](https://bun.sh/) instalado na máquina.
* Docker e Docker Compose a rodar.

### 1. Subir o PostgreSQL via Docker
Na raiz do projeto, suba o contentor da base de dados:
```bash
docker-compose up -d