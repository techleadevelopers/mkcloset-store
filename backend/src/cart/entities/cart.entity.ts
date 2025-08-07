import { Cart as PrismaCart, CartItem as PrismaCartItem, Product as PrismaProduct } from '@prisma/client';

// Define uma entidade para o item do carrinho com o produto incluído
export class CartItemEntity implements PrismaCartItem {
  id: string;
  cartId: string;
  productId: string;
  quantity: number;
  size: string | null;
  color: string | null;
  createdAt: Date;
  updatedAt: Date;
  product: PrismaProduct; // Inclui o produto relacionado
}

// Define uma entidade para o carrinho com os itens incluídos
export class CartEntity implements PrismaCart {
  id: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
  items: CartItemEntity[]; // Lista de itens do carrinho
  total?: number; // Adicionado dinamicamente pelo serviço
  itemCount?: number; // Adicionado dinamicamente pelo serviço
}