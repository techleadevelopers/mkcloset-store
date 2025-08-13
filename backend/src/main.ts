import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { json } from 'express'; // Importe json do express

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // URLs permitidas para CORS
  const allowedOrigins = [
    'http://localhost:5173', // Seu frontend local (Vite)
    'https://e1688003a97e.ngrok-free.app', // Seu frontend via ngrok
    // Em produção, adicione a URL do seu frontend: 'https://seusite.com'
  ];

  // Habilita CORS
  app.enableCors({
    origin: (origin, callback) => {
      // Permite requisições sem origem (ex: Postman)
      if (!origin) {
        return callback(null, true);
      }

      // Verifica se a origem está na lista de origens permitidas
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
  app.use(
    json({
      verify: (req: any, res, buf) => {
        req.rawBody = buf;
      },
    }),
  );

  // Habilita validação global de DTOs
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  // --- MUDANÇA CRUCIAL AQUI ---
  // A porta deve vir da variável de ambiente 'PORT' do Cloud Run.
  // E o app deve escutar em '0.0.0.0'.
  const port = Number(process.env.PORT || 3001);
  await app.listen(port, '0.0.0.0');

  console.log(`Application is running on: ${await app.getUrl()}`);
}

bootstrap();