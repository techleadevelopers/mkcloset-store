import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Habilita CORS para o frontend (ajuste para produção)
  app.enableCors({
    origin: 'http://localhost:3000', // Substitua pelo domínio do seu frontend em produção
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  // Habilita validação global de DTOs
  app.useGlobalPipes(new ValidationPipe({
    transform: true, // Transforma payloads em instâncias de DTO
    whitelist: true, // Remove propriedades que não estão no DTO
    forbidNonWhitelisted: true, // Lança erro se houver propriedades não permitidas
  }));

  const port = process.env.PORT || 3001; // Porta do backend
  await app.listen(port);
  console.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap();