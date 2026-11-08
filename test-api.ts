import { randomUUID } from 'crypto';

async function runTest() {
  console.log('🧪 A iniciar teste de integração da API de Wagering...');

  const payload = {
    providerId: 'provider-test',
    externalTransactionId: `ext-tx-${Date.now()}`,
    playerId: randomUUID(),
    walletId: randomUUID(), // Numa app real, usaria um ID de wallet existente
    roundId: 'round-001',
    gameId: 'slot-game-xyz',
    kind: 'BET',
    money: {
      amount: '50.00',
      currency: 'BRL'
    }
  };

  const idempotencyKey = randomUUID();

  try {
    console.log('📤 A enviar requisição POST para /wagering/transactions...');
    const response = await fetch('http://localhost:3000/wagering/transactions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'idempotency-key': idempotencyKey,
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    
    console.log(`📥 Resposta recebida com Status HTTP: ${response.status}`);
    console.log('📦 Payload de resposta:', JSON.stringify(data, null, 2));

    if (response.ok) {
      console.log('✅ Teste executado com sucesso!');
    } else {
      console.log('⚠️ A requisição retornou um erro controlado pelas regras de negócio.');
    }
  } catch (error) {
    console.error('❌ Erro de conexão com o servidor:', error);
  }
}

runTest();