import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CartService } from 'src/cart/cart.service';
import { UsersService } from 'src/users/users.service';
import { ProductsService } from 'src/products/products.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrderStatus, Prisma } from '@prisma/client'; // Importa o enum OrderStatus e Prisma

interface OrderItemData {
  productId: string;
  quantity: number;
  price: number;
  size: string | null;
  color: string | null;
}

@Injectable()
export class OrdersService {
  constructor(
    private prisma: PrismaService,
    private cartService: CartService,
    private usersService: UsersService,
    private productsService: ProductsService,
  ) {}

  async create(userId: string, createOrderDto: CreateOrderDto) {
    const { paymentMethod, shippingAddressId } = createOrderDto;

    // 1. Obter o carrinho do usuário
    const cart = await this.cartService.getOrCreateCart(userId);
    if (!cart.items || cart.items.length === 0) {
      throw new BadRequestException('O carrinho está vazio.');
    }

    // 2. Verificar estoque e preço atualizado dos produtos
    let totalAmount = 0;
    const orderItemsData: OrderItemData[] = []; // Tipagem explícita
    for (const cartItem of cart.items) {
      const product = await this.productsService.findOne(cartItem.productId);
      if (!product) {
        throw new NotFoundException(`Produto "${cartItem.product.name}" não encontrado.`);
      }
      if (product.stock < cartItem.quantity) {
        throw new BadRequestException(`Estoque insuficiente para o produto "${product.name}". Disponível: ${product.stock}, solicitado: ${cartItem.quantity}.`);
      }
      orderItemsData.push({
        productId: product.id,
        quantity: cartItem.quantity,
        price: product.price, // Captura o preço atual do produto
        size: cartItem.size,
        color: cartItem.color,
      });
      totalAmount += product.price * cartItem.quantity;
    }

    // 3. Obter endereço de entrega
    const userAddresses = await this.usersService.findAddressesByUserId(userId);
    const shippingAddress = userAddresses.find(addr => addr.id === shippingAddressId);

    if (!shippingAddress) {
      throw new NotFoundException('Endereço de entrega não encontrado ou não pertence ao usuário.');
    }

    // 4. Simular cálculo de frete
    const shippingPrice = 25.00; // Exemplo: valor fixo

    // 5. Criar o pedido na transação
    const order = await this.prisma.$transaction(async (prisma) => {
      // Criar o pedido
      const newOrder = await prisma.order.create({
        data: {
          userId,
          status: OrderStatus.PENDING, // Status inicial
          totalAmount: totalAmount + shippingPrice,
          shippingPrice: shippingPrice,
          paymentMethod,
          paymentDetails: createOrderDto.paymentDetails || {}, // Dados adicionais de pagamento
          shippingAddressStreet: shippingAddress.street,
          shippingAddressNumber: shippingAddress.number,
          shippingAddressComplement: shippingAddress.complement,
          shippingAddressNeighborhood: shippingAddress.neighborhood,
          shippingAddressCity: shippingAddress.city,
          shippingAddressState: shippingAddress.state,
          shippingAddressZipCode: shippingAddress.zipCode,
        },
      });

      // Adicionar itens ao pedido e atualizar estoque
      for (const itemData of orderItemsData) {
        await prisma.orderItem.create({
          data: {
            orderId: newOrder.id,
            productId: itemData.productId,
            quantity: itemData.quantity,
            price: itemData.price,
            size: itemData.size,
            color: itemData.color,
          },
        });

        // Decrementar estoque
        await prisma.product.update({
          where: { id: itemData.productId },
          data: { stock: { decrement: itemData.quantity } },
        });
      }

      // Limpar o carrinho do usuário
      await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });

      return newOrder;
    });

    return order;
  }

  async findAllByUserId(userId: string) {
    return this.prisma.order.findMany({
      where: { userId },
      include: { items: { include: { product: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOneByUserId(userId: string, orderId: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId, userId },
      include: {
        items: { include: { product: true } },
        user: true, // ESSA É A LINHA QUE FALTAVA para incluir os dados do usuário
      },
    });
    if (!order) {
      throw new NotFoundException(`Pedido com ID "${orderId}" não encontrado ou não pertence ao usuário.`);
    }
    return order;
  }
}