// hooks/use-cart.tsx

import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useQuery, useMutation, useQueryClient, QueryKey } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Cart, CartItem, Product } from '@/types/backend';

interface CartContextValue {
  items: CartItem[];
  itemCount: number;
  total: number;
  isLoading: boolean;
  addToCart: (productId: string, size?: string | null, color?: string | null, quantity?: number) => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  removeFromCart: (itemId: string) => Promise<void>;
  clearCart: () => Promise<void>;
}

const CartContext = createContext<CartContextValue | undefined>(undefined);

// Função auxiliar para obter ou gerar um guestId
function getOrCreateGuestId(): string {
  let guestId = localStorage.getItem('guestId');
  if (!guestId) {
    // Gerar um UUID v4 simples
    guestId = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
    localStorage.setItem('guestId', guestId);
    console.log('Guest ID gerado e salvo:', guestId); // LOG
  } else {
    console.log('Guest ID existente:', guestId); // LOG
  }
  return guestId;
}

export function CartProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const isAuthenticated = !!localStorage.getItem('access_token');
  const guestId = getOrCreateGuestId();

  const cartQueryKey: QueryKey = ['cart', isAuthenticated ? 'user' : 'guest', isAuthenticated ? undefined : guestId];

  const { data: cart, isLoading, error } = useQuery<Cart, Error>({
    queryKey: cartQueryKey,
    queryFn: async () => {
      let res: Response;
      if (isAuthenticated) {
        res = await apiRequest('GET', '/cart');
      } else {
        res = await apiRequest('GET', `/cart/guest?guestId=${guestId}`);
      }

      if (!res.ok) {
        const errorData = await res.json(); // Tenta ler o erro para logar
        console.error('Erro ao carregar carrinho (GET):', res.status, errorData); // LOG
        throw new Error(errorData.message || "Erro ao carregar carrinho.");
      }
      const rawCartData = await res.json(); // Recebe { data: CartObject }
      console.log('Dados do carrinho recebidos (GET):', rawCartData); // LOG
      return rawCartData.data; // <--- DESEMBRULHE AQUI!
    },
    enabled: isAuthenticated || !!guestId,
    staleTime: 1000 * 60,
  });

  const items = cart?.items || [];
  const total = cart?.total || 0;
  const itemCount = cart?.itemCount || 0;

  console.log('Estado atual do carrinho no frontend:', { itemsCount: items.length, total, isLoading }); // LOG

  const addMutation = useMutation<Cart, Error, { productId: string; quantity: number; size?: string | null; color?: string | null }>({
    mutationFn: async (itemData) => {
      const payload: any = {
        productId: itemData.productId,
        quantity: itemData.quantity,
        size: itemData.size,
        color: itemData.color,
      };

      if (!isAuthenticated) {
        payload.guestId = guestId;
      }

      console.log('Enviando payload para adicionar item:', payload); // LOG
      const res = await apiRequest('POST', '/cart/items', payload);
      if (!res.ok) {
        const errorData = await res.json();
        console.error('Erro na resposta da adição do item (POST):', res.status, errorData); // LOG
        throw new Error(errorData.message || "Erro ao adicionar item.");
      }
      const newCartResponse = await res.json(); // Recebe { data: CartObject }
      console.log('Resposta da adição do item (POST):', newCartResponse); // LOG
      return newCartResponse.data; // <--- DESEMBRULHE AQUI!
    },
    onSuccess: (newCart) => {
      console.log('Mutação de adição bem-sucedida. Atualizando cache com:', newCart); // LOG
      queryClient.setQueryData<Cart>(cartQueryKey, newCart);
      toast({ title: "Produto adicionado", description: "Item adicionado ao carrinho com sucesso!" });
    },
    onError: (err) => {
      console.error('Erro na mutação de adição:', err); // LOG
      toast({ title: "Erro ao adicionar", description: err.message, variant: "destructive" });
    },
    onSettled: () => {
      console.log('Mutação de adição finalizada. Invalidando queries do carrinho.'); // LOG
      queryClient.invalidateQueries({ queryKey: cartQueryKey });
    }
  });

  const addToCart = async (productId: string, size: string | null = null, color: string | null = null, quantity: number = 1) => {
    await addMutation.mutateAsync({ productId, quantity, size, color });
  };

  // ... (restante do código permanece o mesmo) ...
  const updateMutation = useMutation<Cart, Error, { itemId: string; quantity: number }>({
    mutationFn: async ({ itemId, quantity }) => {
      const res = await apiRequest('PATCH', `/cart/items/${itemId}`, { quantity });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Erro ao atualizar item.");
      }
      const rawUpdateResponse = await res.json();
      return rawUpdateResponse.data; // <--- DESEMBRULHE AQUI!
    },
    onSuccess: (newCart) => {
      queryClient.setQueryData<Cart>(cartQueryKey, newCart);
      toast({ title: "Carrinho atualizado", description: "Quantidade alterada com sucesso." });
    },
    onError: (err) => {
      toast({ title: "Erro ao atualizar", description: err.message, variant: "destructive" });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: cartQueryKey });
    }
  });

  const updateQuantity = async (itemId: string, quantity: number) => {
    await updateMutation.mutateAsync({ itemId, quantity });
  };

  const removeMutation = useMutation<Cart, Error, string>({
    mutationFn: async (itemId) => {
      const res = await apiRequest('DELETE', `/cart/items/${itemId}`);
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Erro ao remover item.");
      }
      const rawRemoveResponse = await res.json();
      return rawRemoveResponse.data; // <--- DESEMBRULHE AQUI!
    },
    onSuccess: (newCart) => {
      queryClient.setQueryData<Cart>(cartQueryKey, newCart);
      toast({ title: "Item removido", description: "Produto removido do carrinho." });
    },
    onError: (err) => {
      toast({ title: "Erro ao remover", description: err.message, variant: "destructive" });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: cartQueryKey });
    }
  });

  const removeFromCart = async (itemId: string) => {
    await removeMutation.mutateAsync(itemId);
  };

  const clearMutation = useMutation<Cart, Error, void>({
    mutationFn: async () => {
      const res = await apiRequest('DELETE', '/cart/clear');
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Erro ao limpar o carrinho.");
      }
      const rawClearResponse = await res.json();
      return rawClearResponse.data; // <--- DESEMBRULHE AQUI!
    },
    onSuccess: (newCart) => {
      queryClient.setQueryData<Cart>(cartQueryKey, newCart);
      toast({ title: "Carrinho limpo", description: "Todos os itens foram removidos." });
    },
    onError: (err) => {
      toast({ title: "Erro ao limpar", description: err.message, variant: "destructive" });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: cartQueryKey });
    }
  });

  const clearCart = async () => {
    await clearMutation.mutateAsync();
  };

  const value: CartContextValue = {
    items,
    itemCount,
    total,
    isLoading: isLoading || addMutation.isPending || updateMutation.isPending || removeMutation.isPending || clearMutation.isPending,
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