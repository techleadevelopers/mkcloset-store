import { Controller, Post, Body, UseGuards, Req, Param } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { ProcessPaymentDto } from './dto/process-payment.dto';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import type { User } from '@prisma/client';
import type { Request } from 'express';

@UseGuards(JwtAuthGuard)
@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('process/:orderId')
  async processPayment(
    @CurrentUser() user: User,
    @Param('orderId') orderId: string,
    @Body() processPaymentDto: ProcessPaymentDto,
  ) {
    return this.paymentsService.processPayment(user.id, orderId, processPaymentDto);
  }

  // Exemplo de rota para webhook de gateway de pagamento
  @Post('webhook/stripe')
  async handleStripeWebhook(@Req() req: Request) {
    // Validação de assinatura do webhook é CRÍTICA aqui
    console.log('Stripe Webhook Received:', req.body);
    return { received: true };
  }
}