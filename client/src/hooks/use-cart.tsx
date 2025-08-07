// hooks/use-cart.tsx

import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useQuery, useMutation, useQueryClient, QueryKey } from '@tanstack/react-query'; // Importado QueryKey
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

export function CartProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: cart, isLoading, error } = useQuery<Cart, Error>({ // Adicionado o tipo de erro
    queryKey: ['cart'],
    queryFn: async () => {
      const res = await apiRequest('GET', '/cart');
      if (!res.ok) {
        throw new Error("Erro ao carregar carrinho.");
      }
      return res.json();
    },
    enabled: !!localStorage.getItem('access_token'),
    staleTime: 1000 * 60,
  });

  // A tipagem 'Cart' já garante que items, total e itemCount existem.
  // O uso do operador '?' já lida com o caso em que 'cart' é undefined.
  const items = cart?.items || [];
  const total = cart?.total || 0;
  const itemCount = cart?.itemCount || 0;

  // Mutação para adicionar item ao carrinho
  const addMutation = useMutation<Cart, Error, { productId: string; quantity: number; size?: string | null; color?: string | null }>({
    mutationFn: async (itemData) => {
      const res = await apiRequest('POST', '/cart/items', itemData);
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Erro ao adicionar item.");
      }
      return res.json();
    },
    onSuccess: (newCart) => {
      queryClient.setQueryData<Cart>(['cart'], newCart); // Tipagem para newCart
      toast({ title: "Produto adicionado", description: "Item adicionado ao carrinho com sucesso!" });
    },
    onError: (err) => {
      toast({ title: "Erro ao adicionar", description: err.message, variant: "destructive" });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] }); // Corrigido para a v5
    }
  });

  const addToCart = async (productId: string, size: string | null = null, color: string | null = null, quantity: number = 1) => {
    await addMutation.mutateAsync({ productId, quantity, size, color });
  };

  // Mutação para atualizar quantidade de item no carrinho
  const updateMutation = useMutation<Cart, Error, { itemId: string; quantity: number }>({
    mutationFn: async ({ itemId, quantity }) => {
      const res = await apiRequest('PATCH', `/cart/items/${itemId}`, { quantity });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Erro ao atualizar item.");
      }
      return res.json();
    },
    onSuccess: (newCart) => {
      queryClient.setQueryData<Cart>(['cart'], newCart);
      toast({ title: "Carrinho atualizado", description: "Quantidade alterada com sucesso." });
    },
    onError: (err) => {
      toast({ title: "Erro ao atualizar", description: err.message, variant: "destructive" });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] }); // Corrigido para a v5
    }
  });

  const updateQuantity = async (itemId: string, quantity: number) => {
    await updateMutation.mutateAsync({ itemId, quantity });
  };

  // Mutação para remover item do carrinho
  const removeMutation = useMutation<Cart, Error, string>({
    mutationFn: async (itemId) => {
      const res = await apiRequest('DELETE', `/cart/items/${itemId}`);
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Erro ao remover item.");
      }
      return res.json();
    },
    onSuccess: (newCart) => {
      queryClient.setQueryData<Cart>(['cart'], newCart);
      toast({ title: "Item removido", description: "Produto removido do carrinho." });
    },
    onError: (err) => {
      toast({ title: "Erro ao remover", description: err.message, variant: "destructive" });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] }); // Corrigido para a v5
    }
  });

  const removeFromCart = async (itemId: string) => {
    await removeMutation.mutateAsync(itemId);
  };

  // Mutação para limpar o carrinho
  const clearMutation = useMutation<Cart, Error, void>({
    mutationFn: async () => {
      const res = await apiRequest('DELETE', '/cart/clear');
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Erro ao limpar o carrinho.");
      }
      return res.json();
    },
    onSuccess: (newCart) => {
      queryClient.setQueryData<Cart>(['cart'], newCart);
      toast({ title: "Carrinho limpo", description: "Todos os itens foram removidos." });
    },
    onError: (err) => {
      toast({ title: "Erro ao limpar", description: err.message, variant: "destructive" });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] }); // Corrigido para a v5
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