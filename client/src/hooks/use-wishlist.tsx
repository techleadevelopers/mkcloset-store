import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { useToast } from '@/hooks/use-toast';
import { type MockProduct, mockProducts } from '@/lib/mock-data';

interface WishlistItem {
  id: number;
  productId: number;
  sessionId: string;
  product: MockProduct;
}

type WishlistItemWithProduct = WishlistItem;

interface WishlistContextValue {
  items: WishlistItemWithProduct[];
  count: number;
  isLoading: boolean;
  isInWishlist: (productId: number) => boolean;
  addToWishlist: (productId: number) => void;
  removeFromWishlist: (productId: number) => void;
  toggleWishlist: (productId: number) => void;
}

const WishlistContext = createContext<WishlistContextValue | undefined>(undefined);

export function WishlistProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const [items, setItems] = useState<WishlistItemWithProduct[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [wishlistId, setWishlistId] = useState(1);

  // Carregar do localStorage na inicialização
  useEffect(() => {
    const savedWishlist = localStorage.getItem('mkCloset-wishlist');
    if (savedWishlist) {
      try {
        const parsedWishlist = JSON.parse(savedWishlist);
        setItems(parsedWishlist);
        if (parsedWishlist.length > 0) {
          setWishlistId(Math.max(...parsedWishlist.map((item: WishlistItem) => item.id)) + 1);
        }
      } catch (error) {
        console.error('Erro ao carregar wishlist:', error);
      }
    }
  }, []);

  // Salvar no localStorage sempre que items mudar
  useEffect(() => {
    localStorage.setItem('mkCloset-wishlist', JSON.stringify(items));
  }, [items]);

  const count = items.length;

  const isInWishlist = (productId: number) => {
    return items.some(item => item.productId === productId);
  };

  const addToWishlist = async (productId: number) => {
    if (isInWishlist(productId)) {
      return;
    }

    setIsLoading(true);
    
    // Simular delay de rede
    await new Promise(resolve => setTimeout(resolve, 300));
    
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

    const newItem: WishlistItemWithProduct = {
      id: wishlistId,
      productId,
      sessionId: 'mock-session',
      product,
    };

    setItems(prevItems => [...prevItems, newItem]);
    setWishlistId(prev => prev + 1);
    setIsLoading(false);

    toast({
      title: "Adicionado aos favoritos",
      description: `${product.name} foi adicionado à sua lista de desejos`,
    });
  };

  const removeFromWishlist = (productId: number) => {
    const item = items.find(item => item.productId === productId);
    if (!item) return;

    setItems(prevItems => prevItems.filter(item => item.productId !== productId));
    
    toast({
      title: "Removido dos favoritos",
      description: `${item.product.name} foi removido da sua lista de desejos`,
    });
  };

  const toggleWishlist = (productId: number) => {
    if (isInWishlist(productId)) {
      removeFromWishlist(productId);
    } else {
      addToWishlist(productId);
    }
  };

  const value: WishlistContextValue = {
    items,
    count,
    isLoading,
    isInWishlist,
    addToWishlist,
    removeFromWishlist,
    toggleWishlist,
  };

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (context === undefined) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
}