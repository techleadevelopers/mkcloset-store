Documentação Backend - Sistema de Autenticação MK Closet
Overview
Esta documentação detalha como implementar um backend completo com sistema de autenticação para o e-commerce MK Closet, integrando-se perfeitamente com o frontend React existente.

Arquitetura Geral
Stack Tecnológica Recomendada
Backend: Node.js + Express.js + TypeScript
Banco de Dados: PostgreSQL + Drizzle ORM
Autenticação: JWT + Passport.js
Sessões: Redis (opcional para sessions persistentes)
Email: SendGrid ou similar para verificações
Upload de Arquivos: Cloudinary ou AWS S3
Pagamentos: Stripe (já configurado no frontend)
Estrutura de Pastas
server/
├── src/
│   ├── controllers/
│   │   ├── auth.controller.ts
│   │   ├── user.controller.ts
│   │   ├── product.controller.ts
│   │   ├── order.controller.ts
│   │   └── cart.controller.ts
│   ├── middleware/
│   │   ├── auth.middleware.ts
│   │   ├── validation.middleware.ts
│   │   └── error.middleware.ts
│   ├── models/
│   │   ├── user.model.ts
│   │   ├── product.model.ts
│   │   ├── order.model.ts
│   │   └── cart.model.ts
│   ├── routes/
│   │   ├── auth.routes.ts
│   │   ├── user.routes.ts
│   │   ├── product.routes.ts
│   │   └── order.routes.ts
│   ├── services/
│   │   ├── auth.service.ts
│   │   ├── email.service.ts
│   │   └── payment.service.ts
│   ├── utils/
│   │   ├── jwt.util.ts
│   │   ├── validation.util.ts
│   │   └── encryption.util.ts
│   └── app.ts
├── migrations/
└── seeds/
Schema do Banco de Dados
1. Tabela Users
// server/src/models/user.model.ts
import { pgTable, serial, varchar, text, timestamp, boolean, json } from 'drizzle-orm/pg-core';
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  password: varchar('password', { length: 255 }).notNull(),
  firstName: varchar('first_name', { length: 100 }).notNull(),
  lastName: varchar('last_name', { length: 100 }).notNull(),
  phone: varchar('phone', { length: 20 }),
  dateOfBirth: timestamp('date_of_birth'),
  isEmailVerified: boolean('is_email_verified').default(false),
  emailVerificationToken: varchar('email_verification_token', { length: 255 }),
  resetPasswordToken: varchar('reset_password_token', { length: 255 }),
  resetPasswordExpires: timestamp('reset_password_expires'),
  role: varchar('role', { length: 20 }).default('customer'), // customer, admin
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});
export const userAddresses = pgTable('user_addresses', {
  id: serial('id').primaryKey(),
  userId: serial('user_id').references(() => users.id),
  type: varchar('type', { length: 20 }).notNull(), // shipping, billing
  name: varchar('name', { length: 100 }).notNull(),
  street: varchar('street', { length: 255 }).notNull(),
  number: varchar('number', { length: 20 }).notNull(),
  complement: varchar('complement', { length: 100 }),
  neighborhood: varchar('neighborhood', { length: 100 }).notNull(),
  city: varchar('city', { length: 100 }).notNull(),
  state: varchar('state', { length: 2 }).notNull(),
  zipCode: varchar('zip_code', { length: 10 }).notNull(),
  isDefault: boolean('is_default').default(false),
  createdAt: timestamp('created_at').defaultNow(),
});
2. Tabelas de Produtos (migração dos mock data)
// server/src/models/product.model.ts
export const categories = pgTable('categories', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 100 }).notNull(),
  slug: varchar('slug', { length: 100 }).notNull().unique(),
  description: text('description'),
  imageUrl: varchar('image_url', { length: 500 }),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
});
export const products = pgTable('products', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  price: decimal('price', { precision: 10, scale: 2 }).notNull(),
  originalPrice: decimal('original_price', { precision: 10, scale: 2 }),
  categoryId: serial('category_id').references(() => categories.id),
  imageUrl: varchar('image_url', { length: 500 }),
  images: json('images').$type<string[]>(),
  sizes: json('sizes').$type<string[]>(),
  colors: json('colors').$type<string[]>(),
  isNew: boolean('is_new').default(false),
  isFeatured: boolean('is_featured').default(false),
  stock: integer('stock').default(0),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});
3. Tabelas de Pedidos e Carrinho
// server/src/models/order.model.ts
export const orders = pgTable('orders', {
  id: serial('id').primaryKey(),
  userId: serial('user_id').references(() => users.id),
  orderNumber: varchar('order_number', { length: 50 }).notNull().unique(),
  status: varchar('status', { length: 20 }).default('pending'), // pending, processing, shipped, delivered, cancelled
  subtotal: decimal('subtotal', { precision: 10, scale: 2 }).notNull(),
  shippingCost: decimal('shipping_cost', { precision: 10, scale: 2 }).default('0'),
  total: decimal('total', { precision: 10, scale: 2 }).notNull(),
  paymentMethod: varchar('payment_method', { length: 50 }),
  paymentStatus: varchar('payment_status', { length: 20 }).default('pending'),
  stripePaymentIntentId: varchar('stripe_payment_intent_id', { length: 255 }),
  shippingAddress: json('shipping_address'),
  billingAddress: json('billing_address'),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});
export const orderItems = pgTable('order_items', {
  id: serial('id').primaryKey(),
  orderId: serial('order_id').references(() => orders.id),
  productId: serial('product_id').references(() => products.id),
  quantity: integer('quantity').notNull(),
  price: decimal('price', { precision: 10, scale: 2 }).notNull(),
  selectedSize: varchar('selected_size', { length: 10 }),
  selectedColor: varchar('selected_color', { length: 50 }),
});
export const cartItems = pgTable('cart_items', {
  id: serial('id').primaryKey(),
  userId: serial('user_id').references(() => users.id),
  productId: serial('product_id').references(() => products.id),
  quantity: integer('quantity').notNull(),
  selectedSize: varchar('selected_size', { length: 10 }),
  selectedColor: varchar('selected_color', { length: 50 }),
  createdAt: timestamp('created_at').defaultNow(),
});
export const wishlistItems = pgTable('wishlist_items', {
  id: serial('id').primaryKey(),
  userId: serial('user_id').references(() => users.id),
  productId: serial('product_id').references(() => products.id),
  createdAt: timestamp('created_at').defaultNow(),
});
API Endpoints
Autenticação
// server/src/routes/auth.routes.ts
POST   /api/auth/register
POST   /api/auth/login
POST   /api/auth/logout
POST   /api/auth/refresh-token
POST   /api/auth/verify-email
POST   /api/auth/forgot-password
POST   /api/auth/reset-password
GET    /api/auth/me
Usuários
// server/src/routes/user.routes.ts
GET    /api/users/profile
PUT    /api/users/profile
GET    /api/users/addresses
POST   /api/users/addresses
PUT    /api/users/addresses/:id
DELETE /api/users/addresses/:id
PUT    /api/users/change-password
Produtos (migração dos mock data)
// server/src/routes/product.routes.ts
GET    /api/products
GET    /api/products/:id
GET    /api/products/category/:slug
GET    /api/products/featured
GET    /api/products/search?q=termo
GET    /api/categories
Carrinho e Wishlist
// server/src/routes/cart.routes.ts
GET    /api/cart
POST   /api/cart/items
PUT    /api/cart/items/:id
DELETE /api/cart/items/:id
DELETE /api/cart/clear
GET    /api/wishlist
POST   /api/wishlist/items
DELETE /api/wishlist/items/:id
Pedidos
// server/src/routes/order.routes.ts
GET    /api/orders
GET    /api/orders/:id
POST   /api/orders
PUT    /api/orders/:id/cancel
POST   /api/orders/payment/webhook
Implementação dos Controllers
Auth Controller
// server/src/controllers/auth.controller.ts
import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { users } from '../models/user.model';
import { db } from '../database';
export class AuthController {
  async register(req: Request, res: Response) {
    try {
      const { email, password, firstName, lastName, phone } = req.body;
      
      // Verificar se usuário já existe
      const existingUser = await db.select().from(users).where(eq(users.email, email));
      if (existingUser.length > 0) {
        return res.status(400).json({ error: 'Email já cadastrado' });
      }
      
      // Hash da senha
      const hashedPassword = await bcrypt.hash(password, 12);
      
      // Criar usuário
      const newUser = await db.insert(users).values({
        email,
        password: hashedPassword,
        firstName,
        lastName,
        phone,
        emailVerificationToken: generateVerificationToken()
      }).returning();
      
      // Enviar email de verificação
      await emailService.sendVerificationEmail(email, newUser[0].emailVerificationToken);
      
      // Gerar token JWT
      const token = jwt.sign(
        { userId: newUser[0].id, email: newUser[0].email },
        process.env.JWT_SECRET!,
        { expiresIn: '7d' }
      );
      
      res.status(201).json({
        message: 'Usuário criado com sucesso. Verifique seu email.',
        token,
        user: {
          id: newUser[0].id,
          email: newUser[0].email,
          firstName: newUser[0].firstName,
          lastName: newUser[0].lastName,
          isEmailVerified: newUser[0].isEmailVerified
        }
      });
    } catch (error) {
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }
  async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;
      
      // Buscar usuário
      const user = await db.select().from(users).where(eq(users.email, email));
      if (user.length === 0) {
        return res.status(401).json({ error: 'Credenciais inválidas' });
      }
      
      // Verificar senha
      const isPasswordValid = await bcrypt.compare(password, user[0].password);
      if (!isPasswordValid) {
        return res.status(401).json({ error: 'Credenciais inválidas' });
      }
      
      // Gerar token
      const token = jwt.sign(
        { userId: user[0].id, email: user[0].email },
        process.env.JWT_SECRET!,
        { expiresIn: '7d' }
      );
      
      res.json({
        message: 'Login realizado com sucesso',
        token,
        user: {
          id: user[0].id,
          email: user[0].email,
          firstName: user[0].firstName,
          lastName: user[0].lastName,
          isEmailVerified: user[0].isEmailVerified
        }
      });
    } catch (error) {
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }
}
Middleware de Autenticação
// server/src/middleware/auth.middleware.ts
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { users } from '../models/user.model';
import { db } from '../database';
interface AuthRequest extends Request {
  user?: any;
}
export const authenticateToken = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN
  
  if (!token) {
    return res.status(401).json({ error: 'Token de acesso requerido' });
  }
  
  try {
    const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);
    const user = await db.select().from(users).where(eq(users.id, decoded.userId));
    
    if (user.length === 0) {
      return res.status(401).json({ error: 'Usuário não encontrado' });
    }
    
    req.user = user[0];
    next();
  } catch (error) {
    res.status(403).json({ error: 'Token inválido' });
  }
};
export const optionalAuth = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (token) {
    try {
      const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);
      const user = await db.select().from(users).where(eq(users.id, decoded.userId));
      if (user.length > 0) {
        req.user = user[0];
      }
    } catch (error) {
      // Token inválido, mas continua sem autenticação
    }
  }
  
  next();
};
Integração com Frontend Atual
1. Modificações nos Hooks do Frontend
// client/src/hooks/use-auth.tsx
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  isEmailVerified: boolean;
}
interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => void;
  updateProfile: (userData: Partial<User>) => Promise<void>;
}
export const useAuth = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      
      login: async (email: string, password: string) => {
        try {
          const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
          });
          
          const data = await response.json();
          
          if (!response.ok) {
            throw new Error(data.error);
          }
          
          set({
            user: data.user,
            token: data.token,
            isAuthenticated: true,
          });
          
          // Configurar token para requisições futuras
          localStorage.setItem('authToken', data.token);
        } catch (error) {
          throw error;
        }
      },
      
      register: async (userData: RegisterData) => {
        try {
          const response = await fetch('/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(userData),
          });
          
          const data = await response.json();
          
          if (!response.ok) {
            throw new Error(data.error);
          }
          
          set({
            user: data.user,
            token: data.token,
            isAuthenticated: true,
          });
          
          localStorage.setItem('authToken', data.token);
        } catch (error) {
          throw error;
        }
      },
      
      logout: () => {
        set({
          user: null,
          token: null,
          isAuthenticated: false,
        });
        localStorage.removeItem('authToken');
      },
      
      updateProfile: async (userData: Partial<User>) => {
        const { token } = get();
        try {
          const response = await fetch('/api/users/profile', {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify(userData),
          });
          
          const data = await response.json();
          
          if (!response.ok) {
            throw new Error(data.error);
          }
          
          set({ user: { ...get().user!, ...data.user } });
        } catch (error) {
          throw error;
        }
      },
    }),
    {
      name: 'auth-storage',
    }
  )
);
2. Migração do Hook de Carrinho para Backend
// client/src/hooks/use-cart.tsx (versão com backend)
import { create } from 'zustand';
import { useAuth } from './use-auth';
interface CartState {
  items: CartItem[];
  isLoading: boolean;
  fetchCart: () => Promise<void>;
  addItem: (productId: number, quantity: number, size?: string, color?: string) => Promise<void>;
  updateItem: (itemId: number, quantity: number) => Promise<void>;
  removeItem: (itemId: number) => Promise<void>;
  clearCart: () => Promise<void>;
  getTotal: () => number;
}
export const useCart = create<CartState>((set, get) => ({
  items: [],
  isLoading: false,
  
  fetchCart: async () => {
    const { token, isAuthenticated } = useAuth.getState();
    if (!isAuthenticated) return;
    
    set({ isLoading: true });
    try {
      const response = await fetch('/api/cart', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const data = await response.json();
      set({ items: data.items });
    } catch (error) {
      console.error('Erro ao buscar carrinho:', error);
    } finally {
      set({ isLoading: false });
    }
  },
  
  addItem: async (productId: number, quantity: number, size?: string, color?: string) => {
    const { token, isAuthenticated } = useAuth.getState();
    if (!isAuthenticated) {
      // Redirecionar para login ou mostrar modal
      return;
    }
    
    try {
      const response = await fetch('/api/cart/items', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ productId, quantity, size, color }),
      });
      
      if (response.ok) {
        await get().fetchCart(); // Recarregar carrinho
      }
    } catch (error) {
      console.error('Erro ao adicionar item:', error);
    }
  },
  
  // ... outros métodos similares
}));
3. Páginas de Autenticação
// client/src/pages/login.tsx
import { useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useLocation } from 'wouter';
export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const [, setLocation] = useLocation();
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      await login(email, password);
      setLocation('/'); // Redirecionar para home
    } catch (error: any) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900">Entre na sua conta</h2>
          <p className="mt-2 text-gray-600">Ou crie uma nova conta</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
              {error}
            </div>
          )}
          
          <div>
            <Input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          
          <div>
            <Input
              type="password"
              placeholder="Senha"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          
          <Button
            type="submit"
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? 'Entrando...' : 'Entrar'}
          </Button>
        </form>
      </div>
    </div>
  );
}
Passos para Implementação
Fase 1: Setup Inicial do Backend
Configurar projeto backend

mkdir server
cd server
npm init -y
npm install express typescript @types/express @types/node
npm install drizzle-orm pg @types/pg
npm install jsonwebtoken @types/jsonwebtoken bcryptjs @types/bcryptjs
npm install cors helmet express-rate-limit
Configurar banco de dados

Criar banco PostgreSQL
Executar migrations com schemas definidos
Popular tabelas com dados dos mock atuais
Implementar autenticação básica

Auth controller (register/login)
Middleware de autenticação
Rotas protegidas
Fase 2: Migração Gradual
Migrar produtos

Mover dados de mock-data.ts para banco
Criar endpoints de produtos
Testar integração com frontend
Implementar carrinho no backend

Migrar hook useCart para usar API
Manter sincronização com banco
Preservar funcionalidade offline (localStorage como fallback)
Sistema de usuários

Páginas de login/registro
Perfil do usuário
Endereços de entrega
Fase 3: Funcionalidades Avançadas
Sistema de pedidos

Checkout com autenticação
Integração com Stripe
Histórico de pedidos
Admin panel

Gerenciamento de produtos
Gerenciamento de pedidos
Dashboard de vendas
Fase 4: Otimizações
Performance

Cache com Redis
Otimização de queries
CDN para images
Segurança

Rate limiting
Validação de dados
Logs de auditoria
Variáveis de Ambiente Necessárias
# Database
DATABASE_URL=postgresql://username:password@localhost:5432/mk_closet
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_DB=mk_closet
POSTGRES_USER=username
POSTGRES_PASSWORD=password
# JWT
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=7d
# Email
SENDGRID_API_KEY=your-sendgrid-key
FROM_EMAIL=noreply@mkcloset.com
# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
# App
NODE_ENV=development
PORT=5000
FRONTEND_URL=http://localhost:5173
# Redis (optional)
REDIS_URL=redis://localhost:6379
# File Upload
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
Considerações Importantes
Compatibilidade com Frontend Atual
Manter toda funcionalidade offline como fallback
Implementar progressive enhancement
Preservar UX existente durante migração
Usar mesma estrutura de dados do mock
Segurança
Validação rigorosa de inputs
Rate limiting em endpoints sensíveis
Logs de auditoria para actions críticas
HTTPS obrigatório em produção
Performance
Paginação em listagens
Cache de queries frequentes
Otimização de imagens
Compressão de responses
Escalabilidade
Estrutura preparada para microserviços
Banco normalizado corretamente
APIs RESTful seguindo padrões
Documentação com Swagger/OpenAPI
Esta documentação fornece o roadmap completo para implementar um backend robusto que se integre perfeitamente com o frontend MK Closet existente, mantendo toda funcionalidade atual e adicionando sistema de autenticação completo.