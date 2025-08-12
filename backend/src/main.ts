// src/main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { json } from 'express'; // Importe json do express

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // URLs permitidas para CORS
  // É crucial que estas URLs correspondam exatamente às origens do seu frontend.
  // Em produção, você substituirá 'http://localhost:5173' e a URL do ngrok
  // pelo domínio real do seu frontend (ex: 'https://seusite.com').
  const allowedOrigins = [
    'http://localhost:5173', // Seu frontend local (Vite)
    'https://e1688003a97e.ngrok-free.app', // Seu frontend via ngrok
    // Se o seu backend também precisar fazer requisições para si mesmo através da URL ngrok,
    // ou se você tiver outros domínios de frontend, adicione-os aqui.
    // Exemplo: 'https://bf8fb8d10dda.ngrok-free.app'
  ];

  // Habilita CORS
  app.enableCors({
    origin: (origin, callback) => {
      // Permite requisições sem origem (ex: de ferramentas como Postman/Insomnia, ou curl)
      if (!origin) {
        return callback(null, true);
      }
      // Verifica se a origem da requisição está na lista de origens permitidas
      if (allowedOrigins.indexOf(origin) === -1) {
        const msg = `A política CORS para este site não permite acesso da origem especificada: ${origin}.`;
        return callback(new Error(msg), false);
      }
      return callback(null, true);
    },
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  // Configuração para obter o rawBody para webhooks
  // É crucial que este middleware seja configurado ANTES de qualquer outro parser de body
  // para que o buffer original da requisição esteja disponível para verificação de assinatura.
  app.use(json({
    verify: (req: any, res, buf) => {
      // req.rawBody será o buffer original da requisição
      req.rawBody = buf;
    },
  }));

  // Habilita validação global de DTOs
  app.useGlobalPipes(new ValidationPipe({
    transform: true, // Automaticamente transforma payloads em instâncias de DTO
    whitelist: true, // Remove propriedades que não estão definidas no DTO
    forbidNonWhitelisted: true, // Lança um erro se propriedades não definidas no DTO forem enviadas
  }));

  const port = process.env.PORT || 3001; // Define a porta, usando a variável de ambiente PORT se disponível
  await app.listen(port);
  console.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap();