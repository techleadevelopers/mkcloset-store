// hooks/use-shipping-fronted.tsx

import { useState, useCallback } from 'react';
import { apiRequest } from '@/lib/queryClient';
import { ShippingResult, ShippingOption, ProductForShipping, CartItemForShipping } from '@/types/backend'; // Importa as interfaces do backend

export function useShippingFrontend() {
  const [shippingData, setShippingData] = useState<ShippingResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const calculateShippingRates = useCallback(async (params: {
    zipCode: string;
    items: CartItemForShipping[]; // Espera os itens do carrinho no formato do backend
  }) => {
    setIsLoading(true);
    setError(null);
    
    try {
      if (!params.zipCode || params.zipCode.replace(/\D/g, '').length !== 8) {
        throw new Error('CEP deve ter 8 dígitos');
      }

      const result: ShippingResult = await apiRequest('POST', '/shipping/calculate', {
        zipCode: params.zipCode,
        items: params.items,
      }).then(res => res.json());

      setShippingData(result);
      return result;
    } catch (err: any) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao calcular frete';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const resetShipping = useCallback(() => {
    setShippingData(null);
    setError(null);
  }, []);

  const formatZip = useCallback((zipCode: string): string => {
    const cleanZip = zipCode.replace(/\D/g, '');
    if (cleanZip.length <= 5) return cleanZip;
    return `${cleanZip.slice(0, 5)}-${cleanZip.slice(5, 8)}`;
  }, []);

  return {
    shippingData,
    isLoading,
    error,
    calculateShippingRates,
    resetShipping,
    formatZip,
  };
}