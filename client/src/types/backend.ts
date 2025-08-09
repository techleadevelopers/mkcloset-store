// src/types/backend.ts

// --- Autenticação e Usuário ---
export interface User {
  id: string;
  email: string;
  name: string | null;
  phone: string | null;
  cpf: string | null; // Adicionado o campo CPF
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  access_token: string;
  user: {
    id: string;
    email: string;
    name: string | null;
  };
}

export interface Address {
  id: string;
  userId: string;
  street: string;
  number: string;
  complement: string | null;
  neighborhood: string;
  city: string;
  state: string;
  zipCode: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

// --- Produtos e Categorias ---
export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
}

export interface ProductDimensions {
  length: number;
  width: number;
  height: number;
}

export interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  originalPrice: number | null;
  images: string[];
  categoryId: string;
  category?: Category;
  sizes: string[];
  colors: string[];
  isNew: boolean;
  isFeatured: boolean;
  discount: number | null;
  stock: number;
  weight: number | null;
  dimensions: ProductDimensions | null;
  createdAt: string;
  updatedAt: string;
}

// --- Carrinho ---
export interface CartItem {
  id: string;
  productId: string;
  quantity: number;
  size: string | null;
  color: string | null;
  product: Product;
}

export interface Cart {
  id: string;
  userId: string;
  items: CartItem[];
  total: number;
  itemCount: number;
}

// --- Lista de Desejos ---
export interface WishlistItem {
  id: string;
  productId: string;
  product: Product;
}

export interface Wishlist {
  id: string;
  userId: string;
  items: WishlistItem[];
}

// --- Frete ---
export interface ShippingOption {
  service: string;
  serviceName: string;
  price: number;
  deliveryTime: number;
  error?: string;
}

export interface ShippingResult {
  zipCode: string;
  options: ShippingOption[];
  freeShipping: boolean;
  freeShippingThreshold: number;
}

export interface ProductForShipping {
  id: string;
  name: string;
  price: number;
  weight?: number;
  dimensions?: ProductDimensions;
}

export interface CartItemForShipping {
  id: string;
  product: ProductForShipping;
  quantity: number;
}

// --- Pedidos ---
export type OrderStatus = 'PENDING' | 'PAID' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED' | 'REFUNDED'; // Adicionado REFUNDED para consistência com o backend
export type PaymentMethod = 'PIX' | 'CREDIT_CARD' | 'BOLETO'; // Tipo adicionado para ser consistente com o backend

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  quantity: number;
  price: number;
  size: string | null;
  color: string | null;
  product?: Product;
}

export interface Order {
  id: string;
  userId: string | null; // Pode ser null para pedidos de convidados
  status: OrderStatus;
  totalAmount: number;
  shippingPrice: number;
  shippingAddressStreet: string;
  shippingAddressNumber: string;
  shippingAddressComplement: string | null;
  shippingAddressNeighborhood: string;
  shippingAddressCity: string;
  shippingAddressState: string;
  shippingAddressZipCode: string;
  paymentMethod: PaymentMethod; // Tipo mais específico
  paymentDetails: object | null;
  createdAt: string;
  updatedAt: string;
  items?: OrderItem[];
  shippingService?: string; // Adicionado para correção
  // Campos de convidado no pedido, se aplicável
  guestId?: string | null;
  guestName?: string | null;
  guestEmail?: string | null;
  guestPhone?: string | null;
  guestCpf?: string | null;
}

// --- Pagamentos ---
// NOVO: Adicionado o DTO que o backend espera, com os campos de cartão de crédito
export interface ProcessPaymentDto {
  paymentMethod: PaymentMethod;
  clientCpf?: string;
  clientPhone?: string;
  // Campos de cartão de crédito (condicionais no backend)
  cardToken?: string;
  cardHolderName?: string;
  cardCpf?: string;
  cardInstallments?: number;
  cardBrand?: string;
}

// NOVO: Adicionado DTO de resposta para cobrança PIX para centralizar a tipagem
export interface PixChargeResponseDto {
  transactionId: string;
  status: 'PENDING' | 'COMPLETED' | 'CANCELED' | 'EXPIRED' | 'FAILED';
  brCode: string;
  qrCodeImage: string;
  expiresAt: string;
  amount: number;
  description: string;
  orderId: string;
  brCodeError?: string;
  expirationDate?: string;
}