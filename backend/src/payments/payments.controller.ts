// src/payments/payments.controller.ts
import { Controller, Post, Body, UseGuards, Param, BadRequestException, Logger, Req } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { OptionalJwtAuthGuard } from 'src/auth/guards/optional-jwt-auth.guard';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import type { User } from '@prisma/client';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { CreatePixChargeDto } from './dto/create-pix-charge.dto';
import { Request } from 'express';

// Interface para o payload do usuário injetado no req.user pelo JwtStrategy
interface RequestUserPayload {
  userId: string; // O ID do usuário (sub do JWT)
}

@Controller('payments')
export class PaymentsController {
  private readonly logger = new Logger(PaymentsController.name);

  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('initiate-checkout/:orderId')
  @UseGuards(OptionalJwtAuthGuard)
  async initiatePagSeguroCheckout(
    @CurrentUser() user: User | undefined,
    @Param('orderId') orderId: string,
  ) {
    return this.paymentsService.initiatePagSeguroRedirectCheckout(user?.id, orderId);
  }

  // NOVO ENDPOINT: para criar cobrança PIX
  @Post('pix-charge/:orderId')
  @UseGuards(OptionalJwtAuthGuard) // ALTERADO: Usa o guarda opcional para permitir convidados
  async createPixCharge(
    @CurrentUser() user: User | undefined, // ALTERADO: Usa o decorador CurrentUser para obter o usuário (ou undefined)
    @Param('orderId') orderId: string,
    @Body() body: CreatePixChargeDto, // NOVO: Adicionado para receber o corpo da requisição, que pode conter o guestId
  ) {
    const userId = user?.id || body.guestId; // NOVO: Obtém o ID do usuário autenticado, ou o guestId do corpo da requisição
    if (!userId) {
      throw new BadRequestException('Usuário ou ID de convidado não fornecido.');
    }
    return this.paymentsService.createPixCharge(orderId, userId);
  }

  @Post('webhook/pagseguro')
  async handlePagSeguroWebhook(@Body() payload: any) {
    this.logger.log('Webhook do PagSeguro recebido.');
    const pagSeguroCheckoutId = payload.id || payload.checkout_id;

    if (!pagSeguroCheckoutId) {
      this.logger.error('Payload do webhook PagSeguro inválido: ID do checkout ausente.');
      throw new BadRequestException('Payload do webhook PagSeguro inválido: ID do checkout ausente.');
    }
    
    return this.paymentsService.handlePagSeguroNotification(pagSeguroCheckoutId);
  }
}
