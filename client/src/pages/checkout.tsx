import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { MapPin, CreditCard, ShoppingBag, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useCart } from '@/hooks/use-cart';
import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';
import WhatsAppButton from '@/components/ui/whatsapp-button';
import FrontendShippingCalculator from '@/components/shipping/frontend-shipping-calculator';
import { useLocation } from 'wouter';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest, getOrCreateGuestId } from '@/lib/queryClient';
import { Address, Order, PaymentMethod, User, PixChargeResponseDto } from '@/types/backend'; // Importação corrigida do DTO
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Skeleton } from '@/components/ui/skeleton';

// Resposta esperada ao iniciar o checkout de redirecionamento do PagSeguro
interface PagSeguroRedirectResponse {
  redirectUrl: string;
}

// Tipos para dados de convidado (ajuste conforme seu backend espera)
interface GuestContactInfo {
  name: string;
  email: string;
  phone: string;
  cpf?: string;
}

interface GuestShippingAddress {
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
  zipCode: string;
}

// Estendendo o tipo do createOrderMutation para incluir dados de convidado
interface CreateOrderPayload {
  shippingAddressId?: string;
  paymentMethod: PaymentMethod;
  shippingService: string;
  shippingPrice: number;
  guestId?: string;
  guestContactInfo?: GuestContactInfo;
  guestShippingAddress?: GuestShippingAddress;
  shouldCreateAccount?: boolean;
  guestPassword?: string;
}

// Adicionando um tipo para a resposta esperada da criação do pedido,
// considerando o TransformInterceptor do backend.
interface CreateOrderResponse {
  data: Order;
}

export default function Checkout() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { items: cartItems, total: cartTotal, clearCart, isLoading: isLoadingCart } = useCart();
  const queryClient = useQueryClient();

  const [currentStep, setCurrentStep] = useState(1);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [shippingPrice, setShippingPrice] = useState<number>(0);
  const [selectedShippingService, setSelectedShippingService] = useState<string | null>(null);
  const [shippingDeliveryTime, setShippingDeliveryTime] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('PIX'); // Padrão agora é PIX

  // --- Novos estados para dados de convidado ---
  const [guestName, setGuestName] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [guestCpf, setGuestCpf] = useState('');
  const [guestStreet, setGuestStreet] = useState('');
  const [guestNumber, setGuestNumber] = useState('');
  const [guestComplement, setGuestComplement] = useState('');
  const [guestNeighborhood, setGuestNeighborhood] = useState('');
  const [guestCity, setGuestCity] = useState('');
  const [guestState, setGuestState] = useState('');
  const [guestZipCode, setGuestZipCode] = useState('');
  const [shouldCreateAccount, setShouldCreateAccount] = useState(false);
  const [guestPassword, setGuestPassword] = useState('');
  // --- Fim dos novos estados ---

  // NOVO: Estados para a tela de pagamento PIX
  const [pixData, setPixData] = useState<PixChargeResponseDto | null>(null);
  const [orderId, setOrderId] = useState<string | null>(null);

  const isUserAuthenticated = !!localStorage.getItem('access_token');

  const [shippingCalculatorZipCode, setShippingCalculatorZipCode] = useState('');

  // 1. Buscar endereços do usuário (apenas se autenticado)
  const { data: addresses, isLoading: isLoadingAddresses, error: addressesError } = useQuery<Address[], Error>({
    queryKey: ['userAddresses'],
    queryFn: async () => {
      const res = await apiRequest('GET', '/users/me/addresses');
      return res.json();
    },
    enabled: isUserAuthenticated,
  });
  const selectedAddress = addresses?.find(addr => addr.id === selectedAddressId);
  
  // NOVO: Buscar dados do usuário autenticado para o nome do titular do cartão
  const { data: authenticatedUser } = useQuery<User, Error>({
    queryKey: ['authenticatedUser'],
    queryFn: async () => {
      const res = await apiRequest('GET', '/users/me');
      return res.json();
    },
    enabled: isUserAuthenticated,
  });

  useEffect(() => {
    if (isUserAuthenticated) {
      if (addresses && addresses.length > 0 && !selectedAddressId) {
        const defaultAddress = addresses.find(addr => addr.isDefault) || addresses[0];
        if (defaultAddress) {
          setSelectedAddressId(defaultAddress.id);
          setShippingCalculatorZipCode(defaultAddress.zipCode);
        }
      }
    } else {
      setShippingCalculatorZipCode(guestZipCode);
    }
  }, [isUserAuthenticated, addresses, selectedAddressId, guestZipCode]);
  
  useEffect(() => {
    if (isUserAuthenticated && selectedAddress) {
      setShippingCalculatorZipCode(selectedAddress.zipCode);
    }
  }, [isUserAuthenticated, selectedAddress]);

  useEffect(() => {
    if (addressesError) {
      console.error("Erro ao carregar endereços:", addressesError);
      toast({ title: "Erro", description: "Não foi possível carregar seus endereços.", variant: "destructive" });
    }
  }, [addressesError, toast]);

  // Mutação para criar o pedido no backend
  const createOrderMutation = useMutation<CreateOrderResponse, Error, CreateOrderPayload>({
    mutationFn: async (orderData) => {
      const res = await apiRequest('POST', '/orders', orderData);
      return res.json();
    },
    onError: (error: Error) => {
      toast({ title: "Erro ao criar pedido", description: error.message || "Ocorreu um erro ao criar seu pedido.", variant: "destructive" });
    },
  });

  // REMOVIDO: a mutation de redirecionamento.
  
  // NOVA MUTATION: Para criar uma cobrança PIX no backend
  const createPixChargeMutation = useMutation<PixChargeResponseDto, Error, { orderId: string }>({
    mutationFn: async ({ orderId }) => {
      const res = await apiRequest('POST', `/payments/pix-charge/${orderId}`);
      return res.json();
    },
    onError: (error: Error) => {
      toast({ title: "Erro ao criar cobrança PIX", description: error.message || "Ocorreu um erro ao gerar o pagamento PIX.", variant: "destructive" });
    },
  });

  const handlePlaceOrder = async () => {
    if (cartItems.length === 0) {
      toast({ title: "Erro", description: "Seu carrinho está vazio.", variant: "destructive" });
      setLocation('/products');
      return;
    }
    
    // Validações antes de enviar o pedido
    if (isUserAuthenticated) {
      if (!selectedAddressId) {
        toast({ title: "Erro", description: "Por favor, selecione um endereço de entrega.", variant: "destructive" });
        return;
      }
    } else {
      if (!guestName || !guestEmail || !guestPhone || !guestCpf || !guestStreet || !guestNumber || !guestNeighborhood || !guestCity || !guestState || !guestZipCode) {
        toast({ title: "Erro", description: "Por favor, preencha todos os dados de contato e endereço.", variant: "destructive" });
        return;
      }
      const phoneRegex = /^\(?\d{2}\)?\s?\d{4,5}-?\d{4}$/;
      if (guestPhone && !phoneRegex.test(guestPhone)) {
        toast({ title: "Erro", description: "Por favor, insira um número de telefone válido (ex: (DD) 9XXXX-XXXX).", variant: "destructive" });
        return;
      }
      if (shouldCreateAccount && !guestPassword) {
        toast({ title: "Erro", description: "Por favor, defina uma senha para criar sua conta.", variant: "destructive" });
        return;
      }
    }

    if (!selectedShippingService || shippingPrice === 0) {
      toast({ title: "Erro", description: "Por favor, selecione uma opção de frete.", variant: "destructive" });
      return;
    }

    try {
      const orderPayload: CreateOrderPayload = {
        paymentMethod,
        shippingService: selectedShippingService,
        shippingPrice: shippingPrice,
      };

      if (isUserAuthenticated) {
        orderPayload.shippingAddressId = selectedAddressId!;
      } else {
        orderPayload.guestId = getOrCreateGuestId();
        orderPayload.guestContactInfo = {
          name: guestName,
          email: guestEmail,
          phone: guestPhone,
          cpf: guestCpf,
        };
        orderPayload.guestShippingAddress = {
          street: guestStreet,
          number: guestNumber,
          complement: guestComplement,
          neighborhood: guestNeighborhood,
          city: guestCity,
          state: guestState,
          zipCode: guestZipCode,
        };
        if (shouldCreateAccount) {
          orderPayload.shouldCreateAccount = true;
          orderPayload.guestPassword = guestPassword;
        }
      }

      // 1. Criar o pedido no backend
      const newOrderResponse = await createOrderMutation.mutateAsync(orderPayload);
      const newOrder = newOrderResponse.data;

      if (!newOrder || !newOrder.id) {
        throw new Error('Não foi possível obter o ID do pedido.');
      }
      
      setOrderId(newOrder.id);

      // NOVO: Se o método de pagamento for PIX, criamos a cobrança e mostramos a tela.
      if (paymentMethod === 'PIX') {
        const pixChargeData = await createPixChargeMutation.mutateAsync({ orderId: newOrder.id });
        setPixData(pixChargeData);
      } else {
        // Se for outro método (como Cartão de Crédito ou Boleto),
        // mantemos o fluxo de redirecionamento, mas a mutation é diferente
        const pagSeguroRedirectData = await apiRequest('POST', `/payments/initiate-checkout/${newOrder.id}`).then(res => res.json());
        if (pagSeguroRedirectData.redirectUrl) {
          window.location.href = pagSeguroRedirectData.redirectUrl;
        } else {
          throw new Error('Falha ao obter URL de redirecionamento do PagSeguro.');
        }
      }

      // A limpeza do carrinho é movida para o final do fluxo.
      clearCart();
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      queryClient.invalidateQueries({ queryKey: ['userAddresses'] });

    } catch (error) {
      console.error(error);
      toast({ title: "Erro ao finalizar pedido", description: error instanceof Error ? error.message : "Ocorreu um erro ao finalizar seu pedido.", variant: "destructive" });
    }
  };

  const steps = [
    { id: 1, title: 'Endereço & Frete', icon: MapPin },
    { id: 2, title: 'Pagamento', icon: CreditCard },
    { id: 3, title: 'Revisão', icon: Check }
  ];

  const nextStep = () => {
    if (currentStep === 1) {
      if (isUserAuthenticated) {
        if (!selectedAddressId) {
          toast({ title: "Erro", description: "Por favor, selecione um endereço de entrega.", variant: "destructive" });
          return;
        }
      } else {
        if (!guestName || !guestEmail || !guestPhone || !guestCpf || !guestStreet || !guestNumber || !guestNeighborhood || !guestCity || !guestState || !guestZipCode) {
          toast({ title: "Erro", description: "Por favor, preencha todos os dados de contato e endereço.", variant: "destructive" });
          return;
        }
        const phoneRegex = /^\(?\d{2}\)?\s?\d{4,5}-?\d{4}$/;
        if (guestPhone && !phoneRegex.test(guestPhone)) {
            toast({ title: "Erro", description: "Por favor, insira um número de telefone válido (ex: (DD) 9XXXX-XXXX).", variant: "destructive" });
            return;
        }
        if (shouldCreateAccount && !guestPassword) {
          toast({ title: "Erro", description: "Por favor, defina uma senha para criar sua conta.", variant: "destructive" });
          return;
        }
      }
      if (!selectedShippingService || shippingPrice === 0) {
        toast({ title: "Erro", description: "Por favor, selecione uma opção de frete.", variant: "destructive" });
        return;
      }
    }
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  useEffect(() => {
    if (!isLoadingCart && cartItems.length === 0) {
      toast({ title: "Carrinho Vazio", description: "Adicione produtos ao carrinho para continuar." });
      setLocation('/products');
    }
  }, [isLoadingCart, cartItems.length, addresses, setLocation, toast]);

  const isPlacingOrder = createOrderMutation.isPending || createPixChargeMutation.isPending;

  if (isLoadingCart || (isUserAuthenticated && isLoadingAddresses) || cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 font-montserrat">
        <Header />
        <div className="container mx-auto px-4 py-16 text-center">
          <ShoppingBag className="w-20 h-20 text-gray-400 mx-auto mb-6" />
          <h1 className="text-2xl font-bold text-gray-900 mb-4 font-playfair">Carregando Checkout...</h1>
          <p className="text-gray-600 mb-8 font-montserrat">Por favor, aguarde enquanto preparamos seu pedido.</p>
          <Skeleton className="h-12 w-48 mx-auto" />
        </div>
        <Footer />
      </div>
    );
  }

  // NOVA TELA: Exibir QR Code se os dados do Pix estiverem disponíveis
  if (pixData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 font-montserrat flex items-center justify-center p-4">
        <Card className="w-full max-w-lg mx-auto shadow-2xl border-0">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold text-gray-800 font-playfair">
              Pagamento com PIX
            </CardTitle>
            <p className="text-gray-600 font-montserrat">
              Escaneie o QR Code ou copie o código para finalizar seu pagamento.
            </p>
          </CardHeader>
          <CardContent className="space-y-6 text-center">
            {/* QR Code */}
            {pixData.qrCodeImage ? (
              <div className="flex justify-center">
                <img src={pixData.qrCodeImage} alt="QR Code PIX" className="w-64 h-64 border-2 rounded-lg" />
              </div>
            ) : (
              <div className="bg-gray-200 w-64 h-64 flex items-center justify-center rounded-lg text-gray-500">
                <p>QR Code não disponível.</p>
              </div>
            )}
            
            {/* Código "Copia e Cola" */}
            <div className="space-y-2">
              <Label htmlFor="brCode" className="font-semibold text-gray-800">
                Código Copia e Cola
              </Label>
              <div className="relative">
                <Input
                  id="brCode"
                  value={pixData.brCode}
                  readOnly
                  className="pr-12 text-center overflow-ellipsis overflow-hidden"
                />
                <Button
                  className="absolute right-1 top-1 h-8 w-10 text-xs"
                  onClick={() => {
                    document.execCommand('copy');
                    toast({
                      title: "Copiado!",
                      description: "O código Pix foi copiado para a área de transferência.",
                    });
                  }}
                >
                  Copiar
                </Button>
              </div>
            </div>

            {/* Informações adicionais */}
            <div className="text-sm text-gray-600 space-y-1">
              <p>
                Valor: <span className="font-semibold text-gray-900">R$ {pixData.amount.toFixed(2)}</span>
              </p>
              <p>
                Expira em: <span className="font-semibold">{new Date(pixData.expiresAt).toLocaleTimeString()}</span>
              </p>
            </div>
            
            <p className="text-xs text-gray-500 mt-4">
              Acompanhe o status do seu pedido pelo seu e-mail.
            </p>

            <Button onClick={() => setLocation('/orders')} className="w-full">
              Ver Meus Pedidos
            </Button>

          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 font-montserrat">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-4 font-playfair">Finalizar Compra</h1>
          
          <div className="flex items-center justify-between mb-8">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
                  currentStep >= step.id 
                    ? 'bg-gray-700 text-white' 
                    : 'bg-gray-200 text-gray-600'
                }`}>
                  <step.icon className="w-5 h-5" />
                </div>
                <span className={`ml-2 font-medium ${
                  currentStep >= step.id ? 'text-gray-800' : 'text-gray-500'
                } font-montserrat`}>
                  {step.title}
                </span>
                {index < steps.length - 1 && (
                  <div className={`w-16 h-0.5 mx-4 ${
                    currentStep > step.id ? 'bg-gray-700' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Card className="shadow-lg border-0">
              <CardHeader>
                <CardTitle className="font-playfair">Informações de Entrega e Pagamento</CardTitle>
              </CardHeader>
              <CardContent>
                {currentStep === 1 && (
                  <div className="space-y-6">
                    <h3 className="text-lg font-semibold font-playfair">1. Endereço de Entrega</h3>
                    
                    {isUserAuthenticated ? (
                      addresses && addresses.length === 0 ? (
                        <div className="p-4 bg-blue-50 border border-blue-200 rounded-md text-sm text-blue-700">
                          Você ainda não possui endereços cadastrados. Por favor, adicione um em seu perfil.
                        </div>
                      ) : (
                        <RadioGroup value={selectedAddressId || undefined} onValueChange={setSelectedAddressId}>
                          {addresses?.map((addr: Address) => (
                            <div key={addr.id} className="flex items-center space-x-2 p-3 border rounded-md">
                              <RadioGroupItem value={addr.id} id={`address-${addr.id}`} />
                              <Label htmlFor={`address-${addr.id}`} className="flex flex-col">
                                <span className="font-medium">{addr.street}, {addr.number} {addr.complement && `- ${addr.complement}`}</span>
                                <span className="text-sm text-gray-600">{addr.neighborhood}, {addr.city} - {addr.state}, {addr.zipCode}</span>
                              </Label>
                            </div>
                          ))}
                        </RadioGroup>
                      )
                    ) : ( // Formulário para usuários convidados
                      <div className="space-y-4">
                        <p className="text-sm text-gray-600">Preencha seus dados para a entrega:</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="guestName">Nome Completo</Label>
                            <Input id="guestName" type="text" value={guestName} onChange={(e) => setGuestName(e.target.value)} />
                          </div>
                          <div>
                            <Label htmlFor="guestEmail">Email</Label>
                            <Input id="guestEmail" type="email" value={guestEmail} onChange={(e) => setGuestEmail(e.target.value)} />
                          </div>
                          <div>
                            <Label htmlFor="guestPhone">Telefone</Label>
                            <Input id="guestPhone" type="tel" value={guestPhone} onChange={(e) => setGuestPhone(e.target.value)} />
                          </div>
                          <div>
                            <Label htmlFor="guestCpf">CPF</Label>
                            <Input id="guestCpf" type="text" value={guestCpf} onChange={(e) => setGuestCpf(e.target.value)} />
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="guestStreet">Rua</Label>
                            <Input id="guestStreet" type="text" value={guestStreet} onChange={(e) => setGuestStreet(e.target.value)} />
                          </div>
                          <div>
                            <Label htmlFor="guestNumber">Número</Label>
                            <Input id="guestNumber" type="text" value={guestNumber} onChange={(e) => setGuestNumber(e.target.value)} />
                          </div>
                        </div>
                        <div>
                          <Label htmlFor="guestComplement">Complemento (opcional)</Label>
                          <Input id="guestComplement" type="text" value={guestComplement} onChange={(e) => setGuestComplement(e.target.value)} />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="guestNeighborhood">Bairro</Label>
                            <Input id="guestNeighborhood" type="text" value={guestNeighborhood} onChange={(e) => setGuestNeighborhood(e.target.value)} />
                          </div>
                          <div>
                            <Label htmlFor="guestCity">Cidade</Label>
                            <Input id="guestCity" type="text" value={guestCity} onChange={(e) => setGuestCity(e.target.value)} />
                          </div>
                          <div>
                            <Label htmlFor="guestState">Estado</Label>
                            <Input id="guestState" type="text" value={guestState} onChange={(e) => setGuestState(e.target.value)} />
                          </div>
                          <div>
                            <Label htmlFor="guestZipCode">CEP</Label>
                            <Input id="guestZipCode" type="text" value={guestZipCode} onChange={(e) => {
                              setGuestZipCode(e.target.value);
                              setShippingCalculatorZipCode(e.target.value);
                            }} />
                          </div>
                        </div>
                        <div className="flex items-center space-x-2 mt-4">
                          <input
                            type="checkbox"
                            id="create-account"
                            checked={shouldCreateAccount}
                            onChange={(e) => setShouldCreateAccount(e.target.checked)}
                            className="h-4 w-4 rounded border-gray-300 text-gray-900 focus:ring-gray-900"
                          />
                          <Label htmlFor="create-account" className="text-sm font-medium text-gray-700">
                            Quero criar uma conta para acompanhar meu pedido
                          </Label>
                        </div>
                        {shouldCreateAccount && (
                          <div className="mt-4">
                            <Label htmlFor="guestPassword">Defina uma Senha</Label>
                            <Input
                              id="guestPassword"
                              type="password"
                              value={guestPassword}
                              onChange={(e) => setGuestPassword(e.target.value)}
                              placeholder="********"
                            />
                          </div>
                        )}
                      </div>
                    )}

                    <Separator />

                    <h3 className="text-lg font-semibold font-playfair">2. Opções de Frete</h3>
                    {(isUserAuthenticated && selectedAddress) || (!isUserAuthenticated && shippingCalculatorZipCode) ? (
                      <FrontendShippingCalculator
                        items={cartItems.map(item => ({
                          id: item.id,
                          quantity: item.quantity,
                          product: {
                            id: item.product.id,
                            name: item.product.name,
                            price: parseFloat(item.product.price.toString()),
                            weight: item.product.weight || undefined,
                            dimensions: item.product.dimensions || undefined,
                          }
                        }))}
                        zipCode={shippingCalculatorZipCode}
                        onZipCodeChange={setShippingCalculatorZipCode}
                        onShippingSelect={(price, service, deliveryTime) => {
                          setShippingPrice(price);
                          setSelectedShippingService(service);
                          setShippingDeliveryTime(deliveryTime);
                        }}
                        selectedService={selectedShippingService || undefined}
                      />
                    ) : (
                      <p className="text-gray-600">Selecione um endereço ou preencha o CEP para calcular o frete.</p>
                    )}
                  </div>
                )}

                {currentStep === 2 && (
                  <div className="space-y-6">
                    <div className="flex justify-center mb-4">
                      <img src="/pagseguro.png" alt="Pagamentos via PagSeguro" className="max-w-[150px]" />
                    </div>
                    
                    <h3 className="text-lg font-semibold font-playfair text-center">3. Método de Pagamento</h3>
                    <p className="text-sm text-gray-600 text-center">Escolha sua forma de pagamento para continuar.</p>
                    
                    <RadioGroup value={paymentMethod} onValueChange={(value: PaymentMethod) => setPaymentMethod(value)}>
                      <div className="flex items-center space-x-2 p-3 border rounded-md">
                        <RadioGroupItem value="PIX" id="payment-pix" />
                        <Label htmlFor="payment-pix">PIX</Label>
                      </div>
                      <div className="flex items-center space-x-2 p-3 border rounded-md">
                        <RadioGroupItem value="CREDIT_CARD" id="payment-credit-card" />
                        <Label htmlFor="payment-credit-card">Cartão de Crédito</Label>
                      </div>
                      <div className="flex items-center space-x-2 p-3 border rounded-md">
                        <RadioGroupItem value="BOLETO" id="payment-boleto" />
                        <Label htmlFor="payment-boleto">Boleto Bancário</Label>
                      </div>
                    </RadioGroup>
                    <div className="mt-4 p-4 border rounded-md bg-gray-50">
                        <p className="text-sm text-gray-700">
                          {paymentMethod === 'PIX'
                            ? 'Você receberá um QR Code e um código Copia e Cola para pagar o pedido.'
                            : 'Você será redirecionado para o PagSeguro para concluir seu pagamento.'
                          }
                        </p>
                      </div>
                  </div>
                )}

                {currentStep === 3 && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold font-playfair">4. Revisar Pedido</h3>
                    <div className="space-y-4 p-4 bg-gray-50 rounded-lg font-montserrat">
                      <h4 className="font-semibold">Informações de Contato:</h4>
                      {isUserAuthenticated ? (
                        <>
                          <p>Usuário logado: {authenticatedUser?.name || authenticatedUser?.email}</p>
                          <p>Email: {authenticatedUser?.email}</p>
                          <p>Telefone: {authenticatedUser?.phone || 'N/A'}</p>
                          <p>CPF: {authenticatedUser?.cpf || 'N/A'}</p>
                        </>
                      ) : (
                        <>
                          <p>Nome: {guestName}</p>
                          <p>Email: {guestEmail}</p>
                          <p>Telefone: {guestPhone}</p>
                          <p>CPF: {guestCpf}</p>
                        </>
                      )}

                      <h4 className="font-semibold mt-4">Endereço de Entrega:</h4>
                      {isUserAuthenticated && selectedAddress ? (
                        <>
                          <p>{selectedAddress.street}, {selectedAddress.number} {selectedAddress.complement && `- ${selectedAddress.complement}`}</p>
                          <p>{selectedAddress.neighborhood}, {selectedAddress.city} - {selectedAddress.state}, {selectedAddress.zipCode}</p>
                        </>
                      ) : !isUserAuthenticated ? (
                        <>
                          <p>{guestStreet}, {guestNumber} {guestComplement && `- ${guestComplement}`}</p>
                          <p>{guestNeighborhood}, {guestCity} - {guestState}, {guestZipCode}</p>
                        </>
                      ) : (
                        <p>Nenhum endereço selecionado.</p>
                      )}
                      
                      <h4 className="font-semibold mt-4">Método de Frete:</h4>
                      <p>{selectedShippingService} - R$ {shippingPrice.toFixed(2)} ({shippingDeliveryTime} dias úteis)</p>

                      <h4 className="font-semibold mt-4">Método de Pagamento:</h4>
                      <p>
                        {paymentMethod === 'CREDIT_CARD' ? 'Cartão de Crédito' : 
                         paymentMethod === 'PIX' ? 'PIX' : 
                         paymentMethod === 'BOLETO' ? 'Boleto Bancário' : 'Não selecionado'}
                      </p>
                    </div>
                  </div>
                )}

                <div className="flex justify-between pt-6">
                  {currentStep > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={prevStep}
                      className="border-gray-200 hover:bg-gray-50 font-montserrat"
                    >
                      Voltar
                    </Button>
                  )}
                  
                  {currentStep < steps.length ? (
                    <Button
                      type="button"
                      onClick={nextStep}
                      className="ml-auto bg-gradient-to-r from-gray-800 to-black hover:from-gray-900 hover:to-gray-800 text-white font-montserrat"
                    >
                      Continuar
                    </Button>
                  ) : (
                    <Button
                      type="button"
                      onClick={handlePlaceOrder}
                      disabled={isPlacingOrder}
                      className="ml-auto bg-gradient-to-r from-gray-800 to-black hover:from-gray-900 hover:to-gray-800 text-white px-8 py-3 font-montserrat"
                    >
                      {isPlacingOrder ? 'Processando...' : 'Finalizar Pedido'}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          <div>
            <Card className="shadow-xl border-0 sticky top-6 bg-white">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-gray-900 font-playfair">
                  <ShoppingBag className="h-5 w-5" />
                  Resumo do Pedido ({cartItems.length} {cartItems.length === 1 ? 'item' : 'itens'})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {cartItems.map((item) => (
                    <div key={item.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
                      <img
                        src={item.product.images?.[0] || 'https://placehold.co/600x800/e2e8f0/ffffff?text=Sem+Imagem'}
                        alt={item.product.name}
                        className="w-14 h-14 object-cover rounded-lg bg-white shadow-sm"
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-sm text-gray-900 line-clamp-1 font-playfair">
                          {item.product.name}
                        </h4>
                        <p className="text-xs text-gray-500 mt-1 font-montserrat">
                          {item.size && `Tamanho: ${item.size}`}
                          {item.color && ` • Cor: ${item.color}`}
                        </p>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-xs text-gray-600 font-montserrat">Qtd: {item.quantity}</span>
                          <span className="text-sm font-bold text-gray-900 font-montserrat">
                            R$ {(item.product.price * item.quantity).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <Separator />

                <div className="space-y-3 font-montserrat">
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Subtotal</span>
                    <span>R$ {cartTotal.toFixed(2).replace('.', ',')}</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Frete</span>
                    <span className={shippingPrice > 0 ? 'text-gray-900 font-semibold' : 'text-gray-500'}>
                      {shippingPrice > 0 ? `R$ ${shippingPrice.toFixed(2).replace('.', ',')}` : 'Selecione opção'}
                    </span>
                  </div>
                </div>
                
                <Separator className="bg-gray-300" />
                
                <div className="flex justify-between items-center font-montserrat">
                  <span className="text-lg font-bold text-gray-900">Total</span>
                  <span className="text-2xl font-bold text-gray-900">
                    R$ {(cartTotal + shippingPrice).toFixed(2).replace('.', ',')}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      <WhatsAppButton />
      <Footer />
    </div>
  );
}
