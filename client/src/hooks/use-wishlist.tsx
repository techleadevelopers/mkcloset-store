import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useQuery, useMutation, useQueryClient, QueryKey } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Wishlist, WishlistItem, Product } from '@/types/backend';

interface WishlistContextValue {
  items: WishlistItem[];
  count: number;
  isLoading: boolean;
  isInWishlist: (productId: string) => boolean;
  addToWishlist: (productId: string) => Promise<void>;
  removeFromWishlist: (productId: string) => Promise<void>;
  toggleWishlist: (productId: string) => Promise<void>;
}

const WishlistContext = createContext<WishlistContextValue | undefined>(undefined);

export function WishlistProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Query para buscar a wishlist do usuário
  const { data: wishlist, isLoading, error } = useQuery<Wishlist, Error>({ // Adicionado tipo de erro
    queryKey: ['wishlist'],
    queryFn: async () => {
      const res = await apiRequest('GET', '/wishlist');
      if (!res.ok) {
        throw new Error("Erro ao carregar lista de desejos.");
      }
      return res.json();
    },
    enabled: !!localStorage.getItem('access_token'),
    staleTime: 1000 * 60 * 5,
  });

  const items = wishlist?.items || [];
  const count = items.length;

  const isInWishlist = (productId: string) => {
    return items.some(item => item.productId === productId);
  };

  // Mutação para adicionar item à wishlist
  const addMutation = useMutation<Wishlist, Error, string>({ // Corrigido o tipo de retorno para Wishlist
    mutationFn: async (productId) => {
      const res = await apiRequest('POST', '/wishlist/items', { productId });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Erro ao adicionar item.");
      }
      return res.json();
    },
    onSuccess: (newWishlist) => { // newItem agora é a wishlist completa
      queryClient.setQueryData<Wishlist>(['wishlist'], newWishlist);
      const addedItem = newWishlist.items.find(item => item.productId === addMutation.variables);
      if (addedItem) {
        toast({ title: "Adicionado aos favoritos", description: `${addedItem.product.name} foi adicionado à sua lista de desejos` });
      }
    },
    onError: (err: Error) => { // Tipagem explícita para o erro
      toast({ title: "Erro ao adicionar", description: err.message, variant: "destructive" });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['wishlist'] }); // Corrigido para a v5
    }
  });

  const addToWishlist = async (productId: string) => {
    if (isInWishlist(productId)) {
      toast({ title: "Já está nos favoritos", description: "Este produto já está na sua lista de desejos." });
      return;
    }
    await addMutation.mutateAsync(productId);
  };

  // Mutação para remover item da wishlist
  const removeMutation = useMutation<Wishlist, Error, string>({
    mutationFn: async (productId) => {
      const res = await apiRequest('DELETE', `/wishlist/items/${productId}`);
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Erro ao remover item.");
      }
      return res.json();
    },
    onSuccess: (newWishlist) => {
      queryClient.setQueryData<Wishlist>(['wishlist'], newWishlist);
      toast({ title: "Removido dos favoritos", description: "Produto removido da sua lista de desejos." });
    },
    onError: (err: Error) => { // Tipagem explícita para o erro
      toast({ title: "Erro ao remover", description: err.message, variant: "destructive" });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['wishlist'] }); // Corrigido para a v5
    }
  });

  const removeFromWishlist = async (productId: string) => {
    await removeMutation.mutateAsync(productId);
  };

  const toggleWishlist = async (productId: string) => {
    if (isInWishlist(productId)) {
      await removeFromWishlist(productId);
    } else {
      await addToWishlist(productId);
    }
  };

  const value: WishlistContextValue = {
    items,
    count,
    isLoading: isLoading || addMutation.isPending || removeMutation.isPending,
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