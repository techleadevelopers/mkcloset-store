import { 
  categories, products, cartItems, wishlistItems, orders, orderItems,
  type Category, type Product, type CartItem, type WishlistItem, type Order, type OrderItem,
  type InsertCategory, type InsertProduct, type InsertCartItem, type InsertWishlistItem, 
  type InsertOrder, type InsertOrderItem
} from "@shared/schema";

export interface IStorage {
  // Categories
  getCategories(): Promise<Category[]>;
  createCategory(category: InsertCategory): Promise<Category>;
  
  // Products
  getProducts(): Promise<Product[]>;
  getProductsByCategory(categoryId: number): Promise<Product[]>;
  getFeaturedProducts(): Promise<Product[]>;
  getProduct(id: number): Promise<Product | undefined>;
  createProduct(product: InsertProduct): Promise<Product>;
  searchProducts(query: string): Promise<Product[]>;
  
  // Cart
  getCartItems(sessionId: string): Promise<(CartItem & { product: Product })[]>;
  addToCart(item: InsertCartItem): Promise<CartItem>;
  updateCartItem(id: number, quantity: number): Promise<CartItem | undefined>;
  removeFromCart(id: number): Promise<void>;
  clearCart(sessionId: string): Promise<void>;
  
  // Wishlist
  getWishlistItems(sessionId: string): Promise<(WishlistItem & { product: Product })[]>;
  addToWishlist(item: InsertWishlistItem): Promise<WishlistItem>;
  removeFromWishlist(sessionId: string, productId: number): Promise<void>;
  
  // Orders
  createOrder(order: InsertOrder): Promise<Order>;
  createOrderItem(orderItem: InsertOrderItem): Promise<OrderItem>;
  getOrder(id: number): Promise<Order | undefined>;
  updateOrderStatus(id: number, status: string): Promise<Order | undefined>;
}

export class MemStorage implements IStorage {
  private categories: Map<number, Category> = new Map();
  private products: Map<number, Product> = new Map();
  private cartItems: Map<number, CartItem> = new Map();
  private wishlistItems: Map<number, WishlistItem> = new Map();
  private orders: Map<number, Order> = new Map();
  private orderItems: Map<number, OrderItem> = new Map();
  
  private categoryId = 1;
  private productId = 1;
  private cartItemId = 1;
  private wishlistItemId = 1;
  private orderId = 1;
  private orderItemId = 1;

  constructor() {
    this.seedData();
  }

  private seedData() {
    // Categories
    const dresses = this.createCategorySync({ name: "Vestidos", slug: "vestidos", description: "Elegância e sofisticação para todas as ocasiões", imageUrl: "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=400" });
    const casual = this.createCategorySync({ name: "Casual", slug: "casual", description: "Conforto e estilo para o dia a dia", imageUrl: "https://images.unsplash.com/photo-1594633313593-bab3825d0caf?w=400" });
    const accessories = this.createCategorySync({ name: "Acessórios", slug: "acessorios", description: "Detalhes que fazem toda a diferença", imageUrl: "https://images.unsplash.com/photo-1601924582970-9238bcb495d9?w=400" });

    // Products
    this.createProductSync({
      name: "Blusa Feminina Básica",
      description: "Algodão premium, corte moderno",
      price: "89.90",
      categoryId: casual.id,
      imageUrl: "https://images.unsplash.com/photo-1594633313593-bab3825d0caf?w=500",
      images: ["https://images.unsplash.com/photo-1594633313593-bab3825d0caf?w=500"],
      sizes: ["P", "M", "G", "GG"],
      colors: ["Branco", "Preto", "Rosa"],
      featured: true,
      isNew: true,
    });

    this.createProductSync({
      name: "Vestido Midi Floral",
      description: "Tecido fluido, estampa exclusiva",
      price: "139.90",
      originalPrice: "199.90",
      categoryId: dresses.id,
      imageUrl: "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=500",
      images: ["https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=500"],
      sizes: ["P", "M", "G"],
      colors: ["Floral Rosa", "Floral Azul"],
      featured: true,
      discount: 30,
    });

    this.createProductSync({
      name: "Calça Skinny Premium",
      description: "Modelagem perfeita, alta qualidade",
      price: "159.90",
      categoryId: casual.id,
      imageUrl: "https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=500",
      images: ["https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=500"],
      sizes: ["36", "38", "40", "42"],
      colors: ["Azul", "Preto", "Cinza"],
      featured: true,
    });

    this.createProductSync({
      name: "Blazer Executivo",
      description: "Elegância profissional",
      price: "249.90",
      categoryId: casual.id,
      imageUrl: "https://images.unsplash.com/photo-1544022613-e87ca75a784a?w=500",
      images: ["https://images.unsplash.com/photo-1544022613-e87ca75a784a?w=500"],
      sizes: ["P", "M", "G"],
      colors: ["Preto", "Marinho", "Cinza"],
      featured: true,
    });
  }

  private createCategorySync(category: InsertCategory): Category {
    const id = this.categoryId++;
    const newCategory: Category = { 
      ...category, 
      id,
      description: category.description || null,
      imageUrl: category.imageUrl || null
    };
    this.categories.set(id, newCategory);
    return newCategory;
  }

  private createProductSync(product: InsertProduct): Product {
    const id = this.productId++;
    const newProduct: Product = { 
      ...product, 
      id,
      description: product.description || null,
      featured: product.featured || null,
      originalPrice: product.originalPrice || null,
      categoryId: product.categoryId || null,
      images: product.images || null,
      sizes: product.sizes || null,
      colors: product.colors || null,
      inStock: product.inStock || null,
      discount: product.discount || null,
      isNew: product.isNew || null
    };
    this.products.set(id, newProduct);
    return newProduct;
  }

  async getCategories(): Promise<Category[]> {
    return Array.from(this.categories.values());
  }

  async createCategory(category: InsertCategory): Promise<Category> {
    return this.createCategorySync(category);
  }

  async getProducts(): Promise<Product[]> {
    return Array.from(this.products.values());
  }

  async getProductsByCategory(categoryId: number): Promise<Product[]> {
    return Array.from(this.products.values()).filter(p => p.categoryId === categoryId);
  }

  async getFeaturedProducts(): Promise<Product[]> {
    return Array.from(this.products.values()).filter(p => p.featured);
  }

  async getProduct(id: number): Promise<Product | undefined> {
    return this.products.get(id);
  }

  async createProduct(product: InsertProduct): Promise<Product> {
    return this.createProductSync(product);
  }

  async searchProducts(query: string): Promise<Product[]> {
    const lowerQuery = query.toLowerCase();
    return Array.from(this.products.values()).filter(p => 
      p.name.toLowerCase().includes(lowerQuery) || 
      p.description?.toLowerCase().includes(lowerQuery)
    );
  }

  async getCartItems(sessionId: string): Promise<(CartItem & { product: Product })[]> {
    const items = Array.from(this.cartItems.values()).filter(item => item.sessionId === sessionId);
    return items.map(item => ({
      ...item,
      product: this.products.get(item.productId)!
    })).filter(item => item.product);
  }

  async addToCart(item: InsertCartItem): Promise<CartItem> {
    // Check if item already exists
    const existing = Array.from(this.cartItems.values()).find(
      cartItem => cartItem.sessionId === item.sessionId && 
                   cartItem.productId === item.productId &&
                   cartItem.size === item.size &&
                   cartItem.color === item.color
    );

    if (existing) {
      existing.quantity = (existing.quantity || 1) + (item.quantity || 1);
      return existing;
    }

    const id = this.cartItemId++;
    const newItem: CartItem = { 
      ...item, 
      id,
      size: item.size || null,
      quantity: item.quantity || null,
      color: item.color || null
    };
    this.cartItems.set(id, newItem);
    return newItem;
  }

  async updateCartItem(id: number, quantity: number): Promise<CartItem | undefined> {
    const item = this.cartItems.get(id);
    if (item) {
      item.quantity = quantity;
    }
    return item;
  }

  async removeFromCart(id: number): Promise<void> {
    this.cartItems.delete(id);
  }

  async clearCart(sessionId: string): Promise<void> {
    const items = Array.from(this.cartItems.entries()).filter(([_, item]) => item.sessionId === sessionId);
    items.forEach(([id]) => this.cartItems.delete(id));
  }

  async getWishlistItems(sessionId: string): Promise<(WishlistItem & { product: Product })[]> {
    const items = Array.from(this.wishlistItems.values()).filter(item => item.sessionId === sessionId);
    return items.map(item => ({
      ...item,
      product: this.products.get(item.productId)!
    })).filter(item => item.product);
  }

  async addToWishlist(item: InsertWishlistItem): Promise<WishlistItem> {
    // Check if item already exists
    const existing = Array.from(this.wishlistItems.values()).find(
      wishlistItem => wishlistItem.sessionId === item.sessionId && 
                      wishlistItem.productId === item.productId
    );

    if (existing) {
      return existing;
    }

    const id = this.wishlistItemId++;
    const newItem: WishlistItem = { ...item, id };
    this.wishlistItems.set(id, newItem);
    return newItem;
  }

  async removeFromWishlist(sessionId: string, productId: number): Promise<void> {
    const item = Array.from(this.wishlistItems.entries()).find(
      ([_, item]) => item.sessionId === sessionId && item.productId === productId
    );
    if (item) {
      this.wishlistItems.delete(item[0]);
    }
  }

  async createOrder(order: InsertOrder): Promise<Order> {
    const id = this.orderId++;
    const newOrder: Order = { 
      ...order, 
      id, 
      createdAt: new Date(),
      status: order.status || null,
      stripePaymentIntentId: order.stripePaymentIntentId || null
    };
    this.orders.set(id, newOrder);
    return newOrder;
  }

  async createOrderItem(orderItem: InsertOrderItem): Promise<OrderItem> {
    const id = this.orderItemId++;
    const newOrderItem: OrderItem = { 
      ...orderItem, 
      id,
      size: orderItem.size || null,
      color: orderItem.color || null
    };
    this.orderItems.set(id, newOrderItem);
    return newOrderItem;
  }

  async getOrder(id: number): Promise<Order | undefined> {
    return this.orders.get(id);
  }

  async updateOrderStatus(id: number, status: string): Promise<Order | undefined> {
    const order = this.orders.get(id);
    if (order) {
      order.status = status;
    }
    return order;
  }
}

export const storage = new MemStorage();
