// src/payments/payments.service.ts
import { Injectable, InternalServerErrorException, BadRequestException, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { OrdersService } from 'src/orders/orders.service';
import { OrderStatus, TransactionType, Order, User, Prisma } from '@prisma/client';
import { PagSeguroService } from './providers/pagseguro.service';
import { CreatePixChargeDto, PixChargeResponseDto } from './dto/create-pix-charge.dto';
import { Decimal } from '@prisma/client/runtime/library';

type OrderWithDetails = Order & {
    user?: User | null;
    items: {
        product: {
            id: string;
            name: string;
            price: Prisma.Decimal;
        };
        quantity: number;
        price: Prisma.Decimal;
    }[];
};

@Injectable()
export class PaymentsService {
    private readonly logger = new Logger(PaymentsService.name);

    constructor(
        private readonly prisma: PrismaService,
        private readonly ordersService: OrdersService,
        private readonly pagSeguroService: PagSeguroService,
    ) {}

    // Implementação da nova API de pagamentos (PIX)
    async createPixCharge(orderId: string, userId: string): Promise<PixChargeResponseDto> {
        const order: OrderWithDetails = await this.ordersService.findOneById(orderId);

        if (!order) {
            throw new NotFoundException(`Pedido com ID ${orderId} não encontrado.`);
        }

        if (order.status !== OrderStatus.PENDING) {
            throw new BadRequestException('O pedido já foi pago ou está em outro status.');
        }

        if (order.userId && order.userId !== userId) {
            throw new BadRequestException('Acesso não autorizado a este pedido.');
        }

        const clientEmail: string = order.user?.email ?? order.guestEmail ?? '';
        const clientFullName: string = order.user?.name ?? 'Cliente Convidado';
        const clientPhone: string = order.user?.phone ?? order.guestPhone ?? '';
        const clientCpf: string | undefined = order.user?.cpf ?? (order.guestCpf || undefined);

        const items = order.items.map(item => ({
            name: item.product.name,
            quantity: item.quantity,
            unit_amount: new Decimal(item.price),
        }));

        try {
            const pagSeguroResponse = await this.pagSeguroService.createPagSeguroPixCharge({
                orderId: order.id,
                amount: order.totalAmount,
                description: `Pagamento do Pedido #${order.id} na MKCloset`,
                customer: {
                    email: clientEmail,
                    fullName: clientFullName,
                    phone: clientPhone,
                    cpf: clientCpf,
                },
                shippingAddress: {
                    cep: order.shippingAddressZipCode,
                    street: order.shippingAddressStreet,
                    number: order.shippingAddressNumber,
                    complement: order.shippingAddressComplement ?? undefined,
                    neighborhood: order.shippingAddressNeighborhood,
                    city: order.shippingAddressCity,
                    state: order.shippingAddressState,
                },
                shippingService: order.shippingService,
                shippingPrice: order.shippingPrice,
                items: items,
            });
            
            // Cria a transação no banco de dados com os dados do PIX
            await this.prisma.transaction.create({
                data: {
                    userId: order.userId || null,
                    orderId: order.id,
                    amount: order.totalAmount,
                    type: TransactionType.PAYMENT,
                    status: 'PENDING',
                    description: `Cobrança PIX para Pedido #${order.id}`,
                    gatewayTransactionId: pagSeguroResponse.transactionId,
                    transactionRef: pagSeguroResponse.brCode,
                },
            });

            return pagSeguroResponse;

        } catch (error) {
            this.logger.error(`Erro ao criar cobrança PIX para o pedido ${orderId}: ${error.message}`, error.stack);
            if (error instanceof InternalServerErrorException && error.message.startsWith('Falha no PagSeguro:')) {
                throw error;
            }
            throw new InternalServerErrorException('Falha ao iniciar o processo de pagamento PIX com PagSeguro.');
        }
    }


    // Método original de checkout de redirecionamento, mantido para referência
    async initiatePagSeguroRedirectCheckout(userId: string | undefined, orderId: string): Promise<{ redirectUrl: string }> {
        const order: OrderWithDetails = await this.ordersService.findOneById(orderId);

        if (!order) {
            throw new NotFoundException(`Pedido com ID ${orderId} não encontrado.`);
        }

        if (order.userId && userId && order.userId !== userId) {
            throw new BadRequestException('Acesso não autorizado a este pedido.');
        }

        if (order.status !== OrderStatus.PENDING) {
            throw new BadRequestException('O pedido já foi pago ou está em outro status.');
        }

        let clientEmail: string = order.user?.email ?? order.guestEmail ?? '';
        let clientFullName: string = order.user?.name ?? 'Cliente Convidado';
        let clientPhone: string = order.user?.phone ?? order.guestPhone ?? '';
        let clientCpf: string | undefined = order.user?.cpf ?? (order.guestCpf || undefined); // Correção para evitar null

        const pagSeguroItems = order.items.map(item => ({
            name: item.product.name,
            quantity: item.quantity,
            unit_amount: item.price,
        }));

        try {
            const pagSeguroResponse = await this.pagSeguroService.createPagSeguroCheckoutRedirect({
                orderId: order.id,
                amount: order.totalAmount,
                description: `Pagamento do Pedido #${order.id} na MKCloset`,
                customer: {
                    email: clientEmail,
                    fullName: clientFullName,
                    phone: clientPhone,
                    cpf: clientCpf,
                },
                shippingAddress: {
                    cep: order.shippingAddressZipCode,
                    street: order.shippingAddressStreet,
                    number: order.shippingAddressNumber,
                    complement: order.shippingAddressComplement ?? undefined,
                    neighborhood: order.shippingAddressNeighborhood,
                    city: order.shippingAddressCity,
                    state: order.shippingAddressState,
                },
                shippingService: order.shippingService,
                shippingPrice: order.shippingPrice,
                items: pagSeguroItems,
            });

            await this.prisma.transaction.create({
                data: {
                    userId: order.userId || null,
                    orderId: order.id,
                    amount: order.totalAmount,
                    type: TransactionType.PAYMENT,
                    status: 'PENDING_REDIRECT',
                    description: `Iniciação de pagamento via PagSeguro Checkout para Pedido #${order.id}`,
                    gatewayTransactionId: pagSeguroResponse.pagSeguroCheckoutId,
                    transactionRef: pagSeguroResponse.redirectUrl,
                },
            });

            return { redirectUrl: pagSeguroResponse.redirectUrl };

        } catch (error) {
            this.logger.error(`Erro ao iniciar checkout de redirecionamento para o pedido ${orderId}: ${error.message}`, error.stack);
            if (error instanceof InternalServerErrorException && error.message.startsWith('Falha no PagSeguro:')) {
                throw error;
            }
            throw new InternalServerErrorException('Falha ao iniciar o processo de pagamento com PagSeguro.');
        }
    }

    async handlePagSeguroNotification(pagSeguroCheckoutId: string) {
        this.logger.log(`[PaymentsService] Webhook do PagSeguro recebido para checkout ID: ${pagSeguroCheckoutId}`);

        const checkoutDetails = await this.pagSeguroService.getCheckoutDetails(pagSeguroCheckoutId);
        const pagSeguroTransactionStatus = checkoutDetails.status || checkoutDetails.charges?.[0]?.status || 'PENDING';
        const newOrderStatus = this.mapPagSeguroStatusToOrderStatus(pagSeguroTransactionStatus);

        const transaction = await this.prisma.transaction.findFirst({
            where: { gatewayTransactionId: pagSeguroCheckoutId },
            include: { order: true },
        });

        if (!transaction || !transaction.order) {
            this.logger.warn(`Notificação do PagSeguro recebida para o checkout '${pagSeguroCheckoutId}', mas nenhuma transação correspondente foi encontrada.`);
            throw new NotFoundException('Transação não encontrada para o checkout ID fornecido.');
        }

        if (transaction.status === newOrderStatus && transaction.order.status === newOrderStatus) {
            this.logger.log(`Status do pedido ${transaction.order.id} já está atualizado para ${newOrderStatus}.`);
            return { message: 'Status já atualizado' };
        }

        await this.prisma.$transaction([
            this.prisma.transaction.update({
                where: { id: transaction.id },
                data: { status: newOrderStatus },
            }),
            this.prisma.order.update({
                where: { id: transaction.order.id },
                data: { status: newOrderStatus },
            }),
        ]);

        this.logger.log(`Status do pedido ${transaction.order.id} atualizado para ${newOrderStatus} via webhook do PagSeguro.`);
        return { message: 'Status do pedido atualizado com sucesso' };
    }

    private mapPagSeguroStatusToOrderStatus(pagSeguroStatus: string): OrderStatus {
        switch (pagSeguroStatus) {
            case 'PAID':
            case 'APPROVED':
                return OrderStatus.PAID;
            case 'IN_ANALYSIS':
            case 'PENDING':
                return OrderStatus.PENDING;
            case 'CANCELED':
            case 'ABORTED':
                return OrderStatus.CANCELLED;
            case 'REFUNDED':
            case 'SHIPPED':
                return OrderStatus.SHIPPED;
            case 'DELIVERED':
                return OrderStatus.DELIVERED;
            default:
                return OrderStatus.PENDING;
        }
    }
}
