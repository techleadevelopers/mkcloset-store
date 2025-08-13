import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { json } from 'express'; // Importe json do express

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // A porta deve vir da variável de ambiente 'PORT' do Cloud Run.
  // E o app deve escutar em '0.0.0.0'.
  const port = Number(process.env.PORT || 3001);
  await app.listen(port, '0.0.0.0');

  console.log(`Aplicação iniciada com sucesso. Acesse: ${await app.getUrl()}`);
}
bootstrap();