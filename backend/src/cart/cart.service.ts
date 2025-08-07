import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { ProductsService } from 'src/products/products.service';
import { AddToCartDto } from './dto/add-to-cart.dto';
import { Prisma } from '@prisma/client'; // Importa Prisma para usar Prisma.Decimal

@Injectable()
export class CartService {
  constructor(
    private prisma: PrismaService,
    private productsService: ProductsService,
  ) {}

  async getOrCreateCart(userId: string) {
    let cart = await this.prisma.cart.findUnique({
      where: { userId },
      include: {
        items: {
          include: { product: true },
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!cart) {
      cart = await this.prisma.cart.create({
        data: { userId },
        include: { items: { include: { product: true } } },
      });
    }

    return this.calculateCartTotals(cart);
  }

  async addItemToCart(userId: string, addToCartDto: AddToCartDto) {
    const { productId, quantity, size, color } = addToCartDto;

    const product = await this.productsService.findOne(productId);
    if (!product) {
      throw new NotFoundException(`Produto com ID "${productId}" não encontrado.`);
    }

    if (product.stock < quantity) {
      throw new BadRequestException(`Estoque insuficiente para o produto "${product.name}". Disponível: ${product.stock}`);
    }

    const cart = await this.getOrCreateCart(userId);

    const existingCartItem = await this.prisma.cartItem.findFirst({
      where: {
        cartId: cart.id,
        productId,
        size: size || null,
        color: color || null,
      },
    });

    let updatedCart;
    if (existingCartItem) {
      const newQuantity = existingCartItem.quantity + quantity;
      if (product.stock < newQuantity) {
        throw new BadRequestException(`Estoque insuficiente para o produto "${product.name}". Tentando adicionar ${quantity}, mas já tem ${existingCartItem.quantity}. Total: ${newQuantity}, Disponível: ${product.stock}`);
      }
      updatedCart = await this.prisma.cartItem.update({
        where: { id: existingCartItem.id },
        data: { quantity: newQuantity },
        include: { cart: { include: { items: { include: { product: true } } } } },
      });
    } else {
      updatedCart = await this.prisma.cartItem.create({
        data: {
          cartId: cart.id,
          productId,
          quantity,
          size,
          color,
        },
        include: { cart: { include: { items: { include: { product: true } } } } },
      });
    }

    return this.calculateCartTotals(updatedCart.cart);
  }

  async updateCartItemQuantity(userId: string, itemId: string, quantity: number) {
    if (quantity <= 0) {
      return this.removeCartItem(userId, itemId);
    }

    const cart = await this.getOrCreateCart(userId);

    const cartItem = await this.prisma.cartItem.findUnique({
      where: { id: itemId, cartId: cart.id },
      include: { product: true },
    });

    if (!cartItem) {
      throw new NotFoundException(`Item do carrinho com ID "${itemId}" não encontrado.`);
    }

    if (cartItem.product.stock < quantity) {
      throw new BadRequestException(`Estoque insuficiente para o produto "${cartItem.product.name}". Disponível: ${cartItem.product.stock}`);
    }

    const updatedCartItem = await this.prisma.cartItem.update({
      where: { id: itemId },
      data: { quantity },
      include: { cart: { include: { items: { include: { product: true } } } } },
    });

    return this.calculateCartTotals(updatedCartItem.cart);
  }

  async removeCartItem(userId: string, itemId: string) {
    const cart = await this.getOrCreateCart(userId);

    const cartItem = await this.prisma.cartItem.findUnique({
      where: { id: itemId, cartId: cart.id },
    });

    if (!cartItem) {
      throw new NotFoundException(`Item do carrinho com ID "${itemId}" não encontrado.`);
    }

    await this.prisma.cartItem.delete({ where: { id: itemId } });

    const updatedCart = await this.prisma.cart.findUnique({
      where: { id: cart.id },
      include: { items: { include: { product: true } } },
    });

    return this.calculateCartTotals(updatedCart as Prisma.CartGetPayload<{ include: { items: { include: { product: true } } } }>);
  }

  async clearCart(userId: string) {
    const cart = await this.getOrCreateCart(userId);
    await this.prisma.cartItem.deleteMany({ where: { cartId: cart.id } });

    const updatedCart = await this.prisma.cart.findUnique({
      where: { id: cart.id },
      include: { items: { include: { product: true } } },
    });

    return this.calculateCartTotals(updatedCart as Prisma.CartGetPayload<{ include: { items: { include: { product: true } } } }>);
  }

  private calculateCartTotals(cart: Prisma.CartGetPayload<{ include: { items: { include: { product: true } } } }>) {
    // CORREÇÃO: Converte item.product.price de Decimal para number antes da operação
    const total = cart.items.reduce((sum, item) => sum + item.product.price.toNumber() * item.quantity, 0);
    const itemCount = cart.items.reduce((sum, item) => sum + item.quantity, 0);
    return { ...cart, total, itemCount };
  }
}