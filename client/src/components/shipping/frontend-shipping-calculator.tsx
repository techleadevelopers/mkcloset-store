import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Truck, Clock, MapPin, CheckCircle } from 'lucide-react';
import { useShippingFrontend } from '@/hooks/use-shipping-fronted';
import { useToast } from '@/hooks/use-toast';

interface CartItem {
  id: string;
  product: {
    id: string;
    name: string;
    price: number;
    weight?: number;
    dimensions?: {
      length: number;
      width: number;
      height: number;
    };
  };
  quantity: number;
}

interface FrontendShippingCalculatorProps {
  items: CartItem[];
  zipCode: string;
  onZipCodeChange: (zipCode: string) => void;
  onShippingSelect: (price: number, service: string, deliveryTime: number) => void;
  selectedService?: string;
}

export default function FrontendShippingCalculator({
  items,
  zipCode,
  onZipCodeChange,
  onShippingSelect,
  selectedService,
}: FrontendShippingCalculatorProps) {
  const [shouldRecalculate, setShouldRecalculate] = useState(true);
  const [locationInfo, setLocationInfo] = useState<{ city?: string; state?: string } | null>(null);
  const { shippingData, isLoading, error, calculateShippingRates, formatZip } = useShippingFrontend();
  const { toast } = useToast();

  // Calculate total weight and value for all items
  const getTotalPackageInfo = () => {
    let totalWeight = 0;
    let totalValue = 0;
    let maxLength = 0;
    let maxWidth = 0;
    let totalHeight = 0;

    items.forEach((item) => {
      const product = item.product;
      totalWeight += (product.weight || 0.3) * item.quantity;
      totalValue += product.price * item.quantity;
      
      if (product.dimensions) {
        maxLength = Math.max(maxLength, product.dimensions.length || 20);
        maxWidth = Math.max(maxWidth, product.dimensions.width || 15);
        totalHeight += (product.dimensions.height || 5) * item.quantity;
      } else {
        maxLength = Math.max(maxLength, 20);
        maxWidth = Math.max(maxWidth, 15);
        totalHeight += 5 * item.quantity;
      }
    });

    return {
      weight: Math.max(totalWeight, 0.1), // Mínimo 100g
      length: Math.max(maxLength, 16), // Mínimo dos Correios
      width: Math.max(maxWidth, 11), // Mínimo dos Correios
      height: Math.max(totalHeight, 2), // Mínimo dos Correios
      value: totalValue,
    };
  };

  const handleCalculateShipping = async () => {
    if (!zipCode || zipCode.replace(/\D/g, '').length !== 8) {
      toast({
        title: "CEP inválido",
        description: "Por favor, digite um CEP válido com 8 dígitos",
        variant: "destructive",
      });
      return;
    }

    setShouldRecalculate(false);

    try {
      const packageInfo = getTotalPackageInfo();
      
      const result = await calculateShippingRates({
        zipCode,
        ...packageInfo,
      });

      // Extrair informações de localização se disponível
      if (result.options.length > 0 && !result.options[0].error) {
        // Fazer uma chamada adicional ao ViaCEP para obter cidade/estado
        try {
          const cleanZip = zipCode.replace(/\D/g, '');
          const response = await fetch(`https://viacep.com.br/ws/${cleanZip}/json/`);
          const locationData = await response.json();
          if (!locationData.erro) {
            setLocationInfo({
              city: locationData.localidade,
              state: locationData.uf,
            });
          }
        } catch (e) {
          // Ignore location fetch errors
        }
      }

      // Auto-select PAC as default option
      if (result.options.length > 0 && !selectedService && !result.options[0].error) {
        const pacOption = result.options.find(opt => opt.service === '41106');
        const defaultOption = pacOption || result.options[0];
        onShippingSelect(defaultOption.price, defaultOption.service, defaultOption.deliveryTime);
      }

    } catch (error) {
      console.error('Erro ao calcular frete:', error);
      toast({
        title: "Erro no cálculo",
        description: error instanceof Error ? error.message : "Não foi possível calcular o frete. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  // Auto-calculate when ZIP code changes and is complete
  useEffect(() => {
    const cleanZip = zipCode.replace(/\D/g, '');
    if (cleanZip.length === 8) {
      setShouldRecalculate(true);
    }
  }, [zipCode]);

  useEffect(() => {
    if (shouldRecalculate && zipCode && !isLoading) {
      const timer = setTimeout(() => {
        handleCalculateShipping();
      }, 500); // Debounce
      
      return () => clearTimeout(timer);
    }
  }, [shouldRecalculate, zipCode]);

  const handleZipCodeInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatZip(e.target.value);
    onZipCodeChange(formatted);
  };

  const totalValue = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const isFreeShipping = false; // Removido frete grátis - usuário deve sempre escolher

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <div className="flex-1">
          <Label htmlFor="shipping-zipcode" className="font-montserrat">
            CEP para calcular frete
          </Label>
          <Input
            id="shipping-zipcode"
            placeholder="00000-000"
            value={zipCode}
            onChange={handleZipCodeInput}
            maxLength={9}
            className="border-gray-200 focus:border-gray-500 focus:ring-gray-500 font-montserrat"
          />
          {locationInfo && (
            <div className="flex items-center gap-1 mt-1 text-xs text-gray-600">
              <MapPin className="h-3 w-3" />
              <span className="font-montserrat">
                {locationInfo.city}, {locationInfo.state}
              </span>
            </div>
          )}
        </div>
        <Button
          onClick={handleCalculateShipping}
          disabled={isLoading || !zipCode}
          variant="outline"
          className="self-end"
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            "Calcular"
          )}
        </Button>
      </div>

      {error && (
        <div className="text-xs text-red-700 bg-red-50 p-3 rounded-lg border border-red-200">
          ❌ {error}
        </div>
      )}

      {shippingData && !error && (
        <div className="space-y-2">
          <Label className="font-montserrat text-sm font-semibold">
            Opções de entrega:
          </Label>
          {shippingData.options.map((option) => (
            <div
              key={option.service}
              className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                selectedService === option.service
                  ? 'border-gray-900 bg-gray-50'
                  : 'border-gray-200 hover:border-gray-300'
              } ${option.error ? 'border-red-200 bg-red-50' : ''}`}
              onClick={() => !option.error && onShippingSelect(option.price, option.service, option.deliveryTime)}
            >
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Truck className={`h-4 w-4 ${option.error ? 'text-red-600' : 'text-gray-600'}`} />
                  <span className={`font-semibold font-montserrat ${option.error ? 'text-red-700' : ''}`}>
                    {option.serviceName}
                  </span>
                </div>
                {!option.error && (
                  <span className="font-bold text-gray-900 font-montserrat">
                    R$ {option.price.toFixed(2)}
                  </span>
                )}
              </div>
              {!option.error && (
                <div className="flex items-center gap-1 mt-1 text-sm text-gray-600">
                  <Clock className="h-3 w-3" />
                  <span className="font-montserrat">
                    {option.deliveryTime} dia{option.deliveryTime !== 1 ? 's' : ''} úteis
                  </span>
                </div>
              )}
              {option.error && (
                <div className="mt-2 text-xs text-red-600 font-montserrat">
                  {option.error}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="text-xs text-blue-700 bg-blue-50 p-3 rounded-lg border border-blue-200">
        ℹ️ Escolha uma opção de frete para finalizar sua compra
      </div>
    </div>
  );
}