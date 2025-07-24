import { useState, useCallback } from 'react';
import { calculateShipping, validateZipCode, formatZipCode, ShippingResult } from '@/lib/shipping-calculator';

export function useShippingFrontend() {
  const [shippingData, setShippingData] = useState<ShippingResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const calculateShippingRates = useCallback(async (params: {
    zipCode: string;
    weight: number;
    value: number;
    length?: number;
    width?: number;
    height?: number;
  }) => {
    setIsLoading(true);
    setError(null);
    
    try {
      if (!validateZipCode(params.zipCode)) {
        throw new Error('CEP deve ter 8 dígitos');
      }

      const result = await calculateShipping(params);
      setShippingData(result);
      return result;
    } catch (err) {
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

  const formatZip = useCallback((zipCode: string) => {
    return formatZipCode(zipCode);
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