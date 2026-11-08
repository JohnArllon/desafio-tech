import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { MikroORM } from '@mikro-orm/core';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  try {
    const orm = app.get(MikroORM);
    // No MikroORM v7, o comando é apenas update()
    await orm.schema.update();
    console.log('✅ Banco de dados PostgreSQL sincronizado com sucesso!');
  } catch (error) {
    console.error('❌ Falha ao criar tabelas:', error);
  }

  await app.listen(3000);
  console.log(`🚀 Motor Financeiro rodando em: ${await app.getUrl()}`);
}
bootstrap();