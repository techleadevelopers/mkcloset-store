import { Injectable, InternalServerErrorException, BadRequestException, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { OrdersService } from 'src/orders/orders.service';
import { OrderStatus, TransactionType } from '@prisma/client';
import { PagSeguroService } from './providers/pagseguro.service';

interface PaymentDetails {
  paymentMethod: 'PIX' | 'CREDIT_CARD' | 'BOLETO';
  clientCpf?: string;
  clientPhone?: string;
}

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly ordersService: OrdersService,
    private readonly pagSeguroService: PagSeguroService,
  ) {}

  async processPayment(userId: string, orderId: string, paymentDetails: PaymentDetails) {
    // 1. Obter o pedido incluindo o usuário para acessar os dados do cliente
    // O método findOneByUserId foi alterado para incluir o usuário.
    const order = await this.ordersService.findOneByUserId(userId, orderId);

    if (order.status !== OrderStatus.PENDING) {
      throw new BadRequestException('O pedido já foi pago ou está em outro status.');
    }

    // Validações adicionais para PIX
    if (paymentDetails.paymentMethod === 'PIX') {
      if (!paymentDetails.clientCpf || !paymentDetails.clientPhone) {
        throw new BadRequestException('CPF e telefone do cliente são obrigatórios para pagamento via PIX.');
      }
    }

    try {
      let transactionResponse: any;

      if (paymentDetails.paymentMethod === 'PIX') {
        const pixDetails = {
          orderId: order.id,
          amount: order.totalAmount.toNumber(),
          description: `Pagamento do Pedido #${order.id}`,
          clientEmail: order.user.email,
          clientFullName: order.user.name || 'Cliente',
          clientCpf: paymentDetails.clientCpf,
          clientPhone: paymentDetails.clientPhone,
          clientAddress: {
            cep: order.shippingAddressZipCode,
            street: order.shippingAddressStreet,
            number: order.shippingAddressNumber,
            complement: order.shippingAddressComplement,
            neighborhood: order.shippingAddressNeighborhood,
            city: order.shippingAddressCity,
            state: order.shippingAddressState,
          },
          notificationUrl: 'SUA_URL_DO_WEBHOOK_AQUI',
        };
        transactionResponse = await this.pagSeguroService.generatePixPayment(pixDetails);
      } else if (paymentDetails.paymentMethod === 'BOLETO') {
        transactionResponse = await this.pagSeguroService.generateBoletoPayment(
          order.totalAmount.toNumber(),
          order.id,
          userId,
        );
      } else {
        throw new BadRequestException('Método de pagamento inválido.');
      }

      await this.prisma.$transaction([
        this.prisma.transaction.create({
          data: {
            userId: userId,
            orderId: order.id,
            amount: order.totalAmount,
            type: TransactionType.PAYMENT,
            status: transactionResponse.status,
            description: `Pagamento do Pedido #${order.id} via ${paymentDetails.paymentMethod}`,
            gatewayTransactionId: transactionResponse.transactionId,
            qrCodeUrl: transactionResponse.qrCodeImage,
            // A propriedade 'qrCode' foi removida, pois não existe no seu schema.prisma.
            // Se você quiser armazenar o 'brCode', adicione `qrCode String?` ao modelo `Transaction`.
          },
        }),
        this.prisma.order.update({
          where: { id: order.id },
          data: { status: OrderStatus.PROCESSING },
        }),
      ]);

      return transactionResponse;
    } catch (error) {
      this.logger.error(`Erro ao processar pagamento para o pedido ${orderId}: ${error.message}`);
      throw new InternalServerErrorException('Falha ao processar o pagamento.');
    }
  }

  async handlePagSeguroNotification(orderId: string) {
    const transactionDetails = await this.pagSeguroService.getNotificationDetails(orderId);

    const newStatus = this.mapPagSeguroStatusToOrderStatus(transactionDetails.status);

    const transaction = await this.prisma.transaction.findFirst({
      where: { gatewayTransactionId: orderId },
      include: { order: { include: { user: true } } }, // Incluímos o pedido e o usuário
    });

    if (!transaction || !transaction.order) {
      this.logger.warn(`Notificação do PagSeguro recebida para o ID de transação '${orderId}', mas nenhuma transação correspondente foi encontrada.`);
      throw new NotFoundException('Transação não encontrada.');
    }

    if (transaction.status === newStatus) {
      return { message: 'Status já atualizado' };
    }

    await this.prisma.$transaction([
      this.prisma.transaction.update({
        where: { id: transaction.id },
        data: { status: newStatus },
      }),
      this.prisma.order.update({
        where: { id: transaction.order.id }, // CORREÇÃO: Usamos transaction.order.id, que é garantido que existe.
        data: { status: newStatus },
      }),
    ]);
    
    this.logger.log(`Status do pedido ${transaction.order.id} atualizado para ${newStatus} via webhook.`);
    return { message: 'Status do pedido atualizado com sucesso' };
  }
  
  private mapPagSeguroStatusToOrderStatus(pagSeguroStatus: string): OrderStatus {
    switch (pagSeguroStatus) {
      case 'PAID':
        return OrderStatus.PAID;
      case 'SHIPPED':
        return OrderStatus.SHIPPED;
      case 'DELIVERED':
        return OrderStatus.DELIVERED;
      case 'CANCELED':
        return OrderStatus.CANCELLED;
      case 'REFUNDED':
        return OrderStatus.REFUNDED;
      case 'PENDING':
      default:
        return OrderStatus.PENDING;
    }
  }
}