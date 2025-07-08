import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { useToast } from '@/hooks/use-toast';
import { type MockProduct, mockProducts } from '@/lib/mock-data';

interface CartItem {
  id: number;
  productId: number;
  sessionId: string;
  quantity: number;
  size?: string;
  color?: string;
  product: MockProduct;
}

type CartItemWithProduct = CartItem;

interface CartContextValue {
  items: CartItemWithProduct[];
  itemCount: number;
  total: number;
  isLoading: boolean;
  addToCart: (productId: number, size?: string, color?: string, quantity?: number) => void;
  updateQuantity: (itemId: number, quantity: number) => void;
  removeFromCart: (itemId: number) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextValue | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const [items, setItems] = useState<CartItemWithProduct[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [cartId, setCartId] = useState(1);

  // Carregar do localStorage na inicialização
  useEffect(() => {
    const savedCart = localStorage.getItem('mkCloset-cart');
    if (savedCart) {
      try {
        const parsedCart = JSON.parse(savedCart);
        setItems(parsedCart);
        if (parsedCart.length > 0) {
          setCartId(Math.max(...parsedCart.map((item: CartItem) => item.id)) + 1);
        }
      } catch (error) {
        console.error('Erro ao carregar carrinho:', error);
      }
    }
  }, []);

  // Salvar no localStorage sempre que items mudar
  useEffect(() => {
    localStorage.setItem('mkCloset-cart', JSON.stringify(items));
  }, [items]);

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const total = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  const addToCart = async (productId: number, size?: string, color?: string, quantity: number = 1) => {
    setIsLoading(true);
    
    // Simular delay de rede
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const product = mockProducts.find(p => p.id === productId);
    if (!product) {
      toast({
        title: "Erro",
        description: "Produto não encontrado",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    // Verificar se já existe no carrinho
    const existingItem = items.find(item => 
      item.productId === productId && 
      item.size === size && 
      item.color === color
    );

    if (existingItem) {
      // Atualizar quantidade
      setItems(prevItems =>
        prevItems.map(item =>
          item.id === existingItem.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        )
      );
    } else {
      // Adicionar novo item
      const newItem: CartItemWithProduct = {
        id: cartId,
        productId,
        sessionId: 'mock-session',
        quantity,
        size,
        color,
        product,
      };
      setItems(prevItems => [...prevItems, newItem]);
      setCartId(prev => prev + 1);
    }

    setIsLoading(false);
  };

  const updateQuantity = (itemId: number, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(itemId);
      return;
    }

    setItems(prevItems =>
      prevItems.map(item =>
        item.id === itemId ? { ...item, quantity } : item
      )
    );
  };

  const removeFromCart = (itemId: number) => {
    setItems(prevItems => prevItems.filter(item => item.id !== itemId));
    toast({
      title: "Item removido",
      description: "Produto removido do carrinho",
    });
  };

  const clearCart = () => {
    setItems([]);
    localStorage.removeItem('mkCloset-cart');
    toast({
      title: "Carrinho limpo",
      description: "Todos os itens foram removidos",
    });
  };

  const value: CartContextValue = {
    items,
    itemCount,
    total,
    isLoading,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}