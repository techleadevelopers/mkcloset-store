// Calculadora de frete frontend-only usando CEP e estimativas regionais
export interface ShippingOption {
  service: string;
  serviceName: string;
  price: number;
  deliveryTime: number;
  error?: string;
}

export interface ShippingResult {
  zipCode: string;
  options: ShippingOption[];
  freeShipping: boolean;
  freeShippingThreshold: number;
}

// Validação de CEP
export function validateZipCode(zipCode: string): boolean {
  const cleanZip = zipCode.replace(/\D/g, '');
  return cleanZip.length === 8;
}

// Formatação de CEP
export function formatZipCode(zipCode: string): string {
  const cleanZip = zipCode.replace(/\D/g, '');
  if (cleanZip.length <= 5) return cleanZip;
  return `${cleanZip.slice(0, 5)}-${cleanZip.slice(5, 8)}`;
}

// Verificar se o CEP existe usando ViaCEP
export async function checkZipCodeExists(zipCode: string): Promise<{
  valid: boolean;
  city?: string;
  state?: string;
  error?: string;
}> {
  try {
    const cleanZip = zipCode.replace(/\D/g, '');
    const response = await fetch(`https://viacep.com.br/ws/${cleanZip}/json/`);
    
    if (!response.ok) {
      return { valid: false, error: 'Erro ao consultar CEP' };
    }
    
    const data = await response.json();
    
    if (data.erro) {
      return { valid: false, error: 'CEP não encontrado' };
    }
    
    return {
      valid: true,
      city: data.localidade,
      state: data.uf,
    };
  } catch (error) {
    return { valid: false, error: 'Erro na consulta do CEP' };
  }
}

// Calcular frete baseado no CEP e dados do produto
export async function calculateShipping(params: {
  zipCode: string;
  weight: number;
  value: number;
  length?: number;
  width?: number;
  height?: number;
}): Promise<ShippingResult> {
  const { zipCode, weight, value } = params;
  
  // Validar CEP
  const zipValidation = await checkZipCodeExists(zipCode);
  if (!zipValidation.valid) {
    return {
      zipCode,
      options: [{
        service: 'error',
        serviceName: 'Erro',
        price: 0,
        deliveryTime: 0,
        error: zipValidation.error || 'CEP inválido'
      }],
      freeShipping: value >= 199,
      freeShippingThreshold: 199,
    };
  }
  
  // Calcular preços baseado na região (primeiros 2 dígitos do CEP)
  const cleanZip = zipCode.replace(/\D/g, '');
  const region = parseInt(cleanZip.substring(0, 2));
  
  let sedexPrice = 25.50;
  let pacPrice = 15.50;
  let sedexTime = 3;
  let pacTime = 8;
  
  // Ajustar preços por região (baseado nas faixas reais dos Correios)
  if (region >= 1 && region <= 19) {
    // São Paulo - SP
    sedexPrice = 20.50;
    pacPrice = 12.50;
    sedexTime = 2;
    pacTime = 5;
  } else if (region >= 20 && region <= 28) {
    // Rio de Janeiro - RJ
    sedexPrice = 22.50;
    pacPrice = 13.50;
    sedexTime = 3;
    pacTime = 6;
  } else if (region >= 30 && region <= 39) {
    // Minas Gerais - MG
    sedexPrice = 24.50;
    pacPrice = 14.50;
    sedexTime = 3;
    pacTime = 7;
  } else if (region >= 40 && region <= 48) {
    // Bahia - BA (Nordeste)
    sedexPrice = 35.50;
    pacPrice = 20.50;
    sedexTime = 5;
    pacTime = 12;
  } else if (region >= 50 && region <= 56) {
    // Pernambuco - PE (Nordeste)
    sedexPrice = 37.50;
    pacPrice = 22.50;
    sedexTime = 6;
    pacTime = 13;
  } else if (region >= 60 && region <= 72) {
    // Centro-Oeste (GO, MT, MS, DF)
    sedexPrice = 38.50;
    pacPrice = 22.50;
    sedexTime = 6;
    pacTime = 14;
  } else if (region >= 80 && region <= 87) {
    // Paraná - PR (Sul)
    sedexPrice = 28.50;
    pacPrice = 16.50;
    sedexTime = 4;
    pacTime = 10;
  } else if (region >= 88 && region <= 89) {
    // Santa Catarina - SC (Sul)
    sedexPrice = 30.50;
    pacPrice = 18.50;
    sedexTime = 4;
    pacTime = 11;
  } else if (region >= 90 && region <= 99) {
    // Rio Grande do Sul - RS (Sul)
    sedexPrice = 32.50;
    pacPrice = 19.50;
    sedexTime = 5;
    pacTime = 12;
  } else {
    // Norte (AC, AP, AM, PA, RO, RR, TO)
    sedexPrice = 45.50;
    pacPrice = 28.50;
    sedexTime = 8;
    pacTime = 18;
  }
  
  // Ajustar preço pelo peso (acima de 1kg)
  if (weight > 1) {
    const extraWeight = weight - 1;
    sedexPrice += extraWeight * 5;
    pacPrice += extraWeight * 3;
  }
  
  // Valor declarado (seguro)
  if (value > 100) {
    const insurance = (value - 100) * 0.02;
    sedexPrice += insurance;
    pacPrice += insurance;
  }
  
  const options: ShippingOption[] = [
    {
      service: '40010',
      serviceName: 'SEDEX',
      price: Math.round(sedexPrice * 100) / 100,
      deliveryTime: sedexTime,
    },
    {
      service: '41106', 
      serviceName: 'PAC',
      price: Math.round(pacPrice * 100) / 100,
      deliveryTime: pacTime,
    },
  ];
  
  return {
    zipCode: formatZipCode(zipCode),
    options,
    freeShipping: false, // Sempre falso - usuário deve escolher opção
    freeShippingThreshold: 999999, // Valor muito alto para nunca ativar
  };
}