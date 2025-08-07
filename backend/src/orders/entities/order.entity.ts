// src/orders/entities/order.entity.ts

import { Order as PrismaOrder, OrderItem as PrismaOrderItem, OrderStatus, Product as PrismaProduct, Prisma } from '@prisma/client';

// Entidade para o item do pedido
export class OrderItemEntity implements PrismaOrderItem {
  id: string;
  orderId: string;
  productId: string;
  quantity: number;
  
  price: Prisma.Decimal;
  
  size: string | null;
  color: string | null;
  createdAt: Date;
  updatedAt: Date;
  product?: PrismaProduct;
}

// Entidade para o pedido
export class OrderEntity implements PrismaOrder {
  id: string;
  userId: string;
  status: OrderStatus;
  
  totalAmount: Prisma.Decimal;
  shippingPrice: Prisma.Decimal;
  
  shippingAddressStreet: string;
  shippingAddressNumber: string;
  shippingAddressComplement: string | null;
  shippingAddressNeighborhood: string;
  shippingAddressCity: string;
  shippingAddressState: string;
  shippingAddressZipCode: string;
  paymentMethod: string;
  paymentDetails: Prisma.JsonValue | null;

  // CORREÇÃO: Adicionada a propriedade 'couponId' para corresponder à interface PrismaOrder
  couponId: string | null;

  createdAt: Date;
  updatedAt: Date;
  items?: OrderItemEntity[];
}