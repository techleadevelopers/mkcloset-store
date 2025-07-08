import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertCartItemSchema, insertWishlistItemSchema, insertOrderSchema } from "@shared/schema";
import session from "express-session";
import MemoryStore from "memorystore";

const MemoryStoreSession = MemoryStore(session);

function generateSessionId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

export async function registerRoutes(app: Express): Promise<Server> {
  app.use(session({
    secret: process.env.SESSION_SECRET || 'dev-secret-key',
    resave: false,
    saveUninitialized: true,
    store: new MemoryStoreSession({
      checkPeriod: 86400000 // prune expired entries every 24h
    }),
    cookie: {
      secure: false,
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
  }));

  // Ensure session has sessionId
  app.use((req, res, next) => {
    if (!(req.session as any).sessionId) {
      (req.session as any).sessionId = generateSessionId();
    }
    next();
  });

  // Categories
  app.get("/api/categories", async (req, res) => {
    try {
      const categories = await storage.getCategories();
      res.json(categories);
    } catch (error: any) {
      res.status(500).json({ message: "Error fetching categories: " + error.message });
    }
  });

  // Products
  app.get("/api/products", async (req, res) => {
    try {
      const { category, search, featured } = req.query;
      let products;

      if (featured === 'true') {
        products = await storage.getFeaturedProducts();
      } else if (category) {
        products = await storage.getProductsByCategory(parseInt(category as string));
      } else if (search) {
        products = await storage.searchProducts(search as string);
      } else {
        products = await storage.getProducts();
      }

      res.json(products);
    } catch (error: any) {
      res.status(500).json({ message: "Error fetching products: " + error.message });
    }
  });

  app.get("/api/products/:id", async (req, res) => {
    try {
      const product = await storage.getProduct(parseInt(req.params.id));
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      res.json(product);
    } catch (error: any) {
      res.status(500).json({ message: "Error fetching product: " + error.message });
    }
  });

  // Cart
  app.get("/api/cart", async (req, res) => {
    try {
      const items = await storage.getCartItems((req.session as any).sessionId);
      res.json(items);
    } catch (error: any) {
      res.status(500).json({ message: "Error fetching cart: " + error.message });
    }
  });

  app.post("/api/cart", async (req, res) => {
    try {
      const validatedData = insertCartItemSchema.parse({
        ...req.body,
        sessionId: (req.session as any).sessionId
      });
      const item = await storage.addToCart(validatedData);
      res.status(201).json(item);
    } catch (error: any) {
      res.status(500).json({ message: "Error adding to cart: " + error.message });
    }
  });

  app.patch("/api/cart/:id", async (req, res) => {
    try {
      const { quantity } = req.body;
      const item = await storage.updateCartItem(parseInt(req.params.id), quantity);
      if (!item) {
        return res.status(404).json({ message: "Cart item not found" });
      }
      res.json(item);
    } catch (error: any) {
      res.status(500).json({ message: "Error updating cart item: " + error.message });
    }
  });

  app.delete("/api/cart/:id", async (req, res) => {
    try {
      await storage.removeFromCart(parseInt(req.params.id));
      res.status(204).send();
    } catch (error: any) {
      res.status(500).json({ message: "Error removing from cart: " + error.message });
    }
  });

  app.delete("/api/cart", async (req, res) => {
    try {
      await storage.clearCart((req.session as any).sessionId);
      res.status(204).send();
    } catch (error: any) {
      res.status(500).json({ message: "Error clearing cart: " + error.message });
    }
  });

  // Wishlist
  app.get("/api/wishlist", async (req, res) => {
    try {
      const items = await storage.getWishlistItems((req.session as any).sessionId);
      res.json(items);
    } catch (error: any) {
      res.status(500).json({ message: "Error fetching wishlist: " + error.message });
    }
  });

  app.post("/api/wishlist", async (req, res) => {
    try {
      const validatedData = insertWishlistItemSchema.parse({
        ...req.body,
        sessionId: (req.session as any).sessionId
      });
      const item = await storage.addToWishlist(validatedData);
      res.status(201).json(item);
    } catch (error: any) {
      res.status(500).json({ message: "Error adding to wishlist: " + error.message });
    }
  });

  app.delete("/api/wishlist/:productId", async (req, res) => {
    try {
      await storage.removeFromWishlist((req.session as any).sessionId, parseInt(req.params.productId));
      res.status(204).send();
    } catch (error: any) {
      res.status(500).json({ message: "Error removing from wishlist: " + error.message });
    }
  });

  // Mock payment for demo
  app.post("/api/create-payment-intent", async (req, res) => {
    try {
      const { amount } = req.body;
      // Mock payment success for demo
      res.json({ 
        clientSecret: "mock_payment_intent_" + Date.now(),
        success: true 
      });
    } catch (error: any) {
      res.status(500).json({ message: "Error creating payment intent: " + error.message });
    }
  });

  // Orders
  app.post("/api/orders", async (req, res) => {
    try {
      const validatedData = insertOrderSchema.parse({
        ...req.body,
        sessionId: (req.session as any).sessionId
      });
      const order = await storage.createOrder(validatedData);
      res.status(201).json(order);
    } catch (error: any) {
      res.status(500).json({ message: "Error creating order: " + error.message });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}