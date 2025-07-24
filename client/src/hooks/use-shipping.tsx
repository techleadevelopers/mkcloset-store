// Este arquivo foi substituído por use-shipping-frontend.tsx
// Mantido apenas para compatibilidade, mas não deve ser usado
// Use use-shipping-frontend.tsx para cálculo de frete frontend-only

import { useState, useCallback } from 'react';

interface LegacyShippingData {
  zipCode: string;
  options: Array<{
    service: string;
    serviceName: string;
    price: number;
    deliveryTime: number;
  }>;
  freeShipping: boolean;
}

export function useShipping() {
  const [shippingData, setShippingData] = useState<LegacyShippingData | null>(null);

  const calculateShipping = useCallback(async (): Promise<LegacyShippingData> => {
    console.warn('useShipping is deprecated. Use useShippingFrontend instead.');
    throw new Error('Esta função foi descontinuada. Use useShippingFrontend.');
  }, []);

  const validateZipCode = useCallback(async () => {
    console.warn('useShipping is deprecated. Use useShippingFrontend instead.');
    throw new Error('Esta função foi descontinuada. Use useShippingFrontend.');
  }, []);

  const resetShipping = useCallback(() => {
    setShippingData(null);
  }, []);

  return {
    shippingData,
    calculateShipping,
    validateZipCode,
    resetShipping,
  };
}