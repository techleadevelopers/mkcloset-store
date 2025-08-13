// src/main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { json } from 'express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as process from 'process';

async function bootstrap() {
  try {
    const app = await NestFactory.create(AppModule, {
      // Adicionamos um logger para ver a causa exata da falha.
      logger: ['error', 'warn', 'log', 'debug', 'verbose'],
    });

    // URLs permitidas para CORS
    const allowedOrigins = [
      'http://localhost:5173',
      'https://e1688003a97e.ngrok-free.app',
    ];

    // Habilita CORS
    app.enableCors({
      origin: (origin, callback) => {
        if (!origin) {
          return callback(null, true);
        }
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

    // Configuração do Swagger
    const swaggerConfig = new DocumentBuilder()
      .setTitle('API Mkcloset')
      .setDescription('Documentação da API da Mkcloset')
      .setVersion('1.0')
      .addBearerAuth()
      .build();
    const document = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup('api', app, document);

    // A porta deve vir da variável de ambiente 'PORT' do Cloud Run.
    const port = Number(process.env.PORT || 3001);
    await app.listen(port, '0.0.0.0');

    console.log(`Aplicação iniciada com sucesso. Acesse: ${await app.getUrl()}`);
  } catch (error) {
    console.error('Erro fatal durante a inicialização da aplicação:', error);
    process.exit(1);
  }
}

bootstrap();