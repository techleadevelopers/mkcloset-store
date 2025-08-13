// src/app.controller.ts
import { Controller, Get, HttpCode, HttpStatus } from '@nestjs/common';
import { AppService } from './app.service'; // Mantenha se você realmente usa o AppService

@Controller() // Este controlador atende à raiz se não tiver um prefixo
export class AppController {
  // Se o seu AppService não for usado para a rota raiz, você pode remover
  // a injeção de dependência e a chamada a this.appService.getHello()
  constructor(private readonly appService: AppService) {}

  @Get() // Esta rota responderá a requisições GET para a URL raiz (/)
  getHello(): string {
    // Retorna a mensagem diretamente, ou chame this.appService.getHello()
    // se o seu AppService realmente fornecer essa string.
    return 'Bem vindo mmkcloset API';
  }

  @Get('health') // Esta rota responderá a requisições GET para /health
  @HttpCode(HttpStatus.OK) // Garante que o status HTTP retornado seja 200 OK
  getHealth(): { status: string } {
    return { status: 'ok' };
  }
}