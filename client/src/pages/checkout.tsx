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
import { apiRequest } from '@/lib/queryClient';
import { Address, Order, ProcessPaymentDto, PaymentMethod } from '@/types/backend';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Skeleton } from '@/components/ui/skeleton';

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
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('CREDIT_CARD');
  const [cpf, setCpf] = useState<string>('');

  // 1. Buscar endereços do usuário
  const { data: addresses, isLoading: isLoadingAddresses, error: addressesError } = useQuery<Address[], Error>({
    queryKey: ['userAddresses'],
    queryFn: async () => {
      const res = await apiRequest('GET', '/users/me/addresses');
      return res.json();
    },
    enabled: !!localStorage.getItem('access_token'),
  });

  // Efeito colateral para definir o endereço padrão quando os dados chegam com sucesso
  useEffect(() => {
    if (addresses && addresses.length > 0 && !selectedAddressId) {
      const defaultAddress = addresses.find(addr => addr.isDefault) || addresses[0];
      if (defaultAddress) {
        setSelectedAddressId(defaultAddress.id);
      }
    }
  }, [addresses, selectedAddressId]);
  
  // Efeito colateral para lidar com erros da requisição
  useEffect(() => {
    if (addressesError) {
      console.error("Erro ao carregar endereços:", addressesError);
      toast({ title: "Erro", description: "Não foi possível carregar seus endereços.", variant: "destructive" });
    }
  }, [addressesError, toast]);

  const selectedAddress = addresses?.find(addr => addr.id === selectedAddressId);
  const [zipCode, setZipCode] = useState(selectedAddress?.zipCode || '');

  useEffect(() => {
    if (selectedAddress) {
      setZipCode(selectedAddress.zipCode);
    }
  }, [selectedAddress]);

  // 2. Mutação para criar o pedido
  const createOrderMutation = useMutation<Order, Error, { shippingAddressId: string; paymentMethod: PaymentMethod; shippingService: string; shippingPrice: number }>({
    mutationFn: async (orderData) => {
      const res = await apiRequest('POST', '/orders', orderData);
      return res.json();
    },
    onError: (error: Error) => {
      toast({ title: "Erro ao criar pedido", description: error.message || "Ocorreu um erro ao criar seu pedido.", variant: "destructive" });
    },
  });

  // 3. Mutação para processar o pagamento
  const processPaymentMutation = useMutation<Order, Error, { orderId: string, paymentData: ProcessPaymentDto }>({
    mutationFn: async ({ orderId, paymentData }) => {
      const res = await apiRequest('POST', `/payments/process/${orderId}`, paymentData);
      return res.json();
    },
    onSuccess: (order: Order) => {
      toast({ title: "Pagamento processado!", description: `Seu pedido #${order.id} foi finalizado.` });
      clearCart();
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      queryClient.invalidateQueries({ queryKey: ['userAddresses'] });
      setLocation(`/order-success?orderId=${order.id}`);
    },
    onError: (error: Error) => {
      toast({ title: "Erro ao processar pagamento", description: error.message || "Ocorreu um erro ao processar o pagamento.", variant: "destructive" });
    },
  });

  const handlePlaceOrder = async () => {
    if (!localStorage.getItem('access_token')) {
      toast({ title: "Erro", description: "Você precisa estar logado para finalizar a compra.", variant: "destructive" });
      setLocation('/login');
      return;
    }

    if (cartItems.length === 0) {
      toast({ title: "Erro", description: "Seu carrinho está vazio.", variant: "destructive" });
      setLocation('/products');
      return;
    }
    
    if (!selectedAddressId) {
      toast({ title: "Erro", description: "Por favor, selecione um endereço de entrega.", variant: "destructive" });
      return;
    }
    if (!selectedShippingService || shippingPrice === 0) {
      toast({ title: "Erro", description: "Por favor, selecione uma opção de frete.", variant: "destructive" });
      return;
    }

    try {
      const newOrder = await createOrderMutation.mutateAsync({
        shippingAddressId: selectedAddressId,
        paymentMethod,
        shippingService: selectedShippingService,
        shippingPrice,
      });

      if (!newOrder.id) {
        throw new Error('Não foi possível obter o ID do pedido.');
      }

      const paymentData: ProcessPaymentDto = {
        paymentMethod,
        clientCpf: cpf || undefined,
      };

      await processPaymentMutation.mutateAsync({
        orderId: newOrder.id,
        paymentData,
      });

    } catch (error) {
      console.error(error);
    }
  };

  const steps = [
    { id: 1, title: 'Endereço & Frete', icon: MapPin },
    { id: 2, title: 'Pagamento', icon: CreditCard },
    { id: 3, title: 'Revisão', icon: Check }
  ];

  const nextStep = () => {
    if (currentStep === 1) {
      if (!selectedAddressId) {
        toast({ title: "Erro", description: "Por favor, selecione um endereço de entrega.", variant: "destructive" });
        return;
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
    if (!localStorage.getItem('access_token') && !isLoadingAddresses) {
      toast({ title: "Acesso Negado", description: "Você precisa estar logado para acessar o checkout." });
      setLocation('/login');
    }
  }, [isLoadingCart, cartItems.length, isLoadingAddresses, setLocation, toast]);

  const isPlacingOrder = createOrderMutation.isPending || processPaymentMutation.isPending;

  if (isLoadingCart || isLoadingAddresses || cartItems.length === 0 || !localStorage.getItem('access_token')) {
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
                    <RadioGroup value={selectedAddressId || undefined} onValueChange={setSelectedAddressId}>
                      {addresses && addresses.length === 0 ? (
                        <div className="p-4 bg-blue-50 border border-blue-200 rounded-md text-sm text-blue-700">
                          Você ainda não possui endereços cadastrados. Por favor, adicione um em seu perfil.
                        </div>
                      ) : (
                        addresses?.map((addr: Address) => (
                          <div key={addr.id} className="flex items-center space-x-2 p-3 border rounded-md">
                            <RadioGroupItem value={addr.id} id={`address-${addr.id}`} />
                            <Label htmlFor={`address-${addr.id}`} className="flex flex-col">
                              <span className="font-medium">{addr.street}, {addr.number} {addr.complement && `- ${addr.complement}`}</span>
                              <span className="text-sm text-gray-600">{addr.neighborhood}, {addr.city} - {addr.state}, {addr.zipCode}</span>
                            </Label>
                          </div>
                        ))
                      )}
                    </RadioGroup>

                    <Separator />

                    <h3 className="text-lg font-semibold font-playfair">2. Opções de Frete</h3>
                    {selectedAddress ? (
                      <FrontendShippingCalculator
                        items={cartItems.map(item => ({
                          id: item.id,
                          quantity: item.quantity,
                          product: {
                            id: item.product.id,
                            name: item.product.name,
                            price: item.product.price,
                            weight: item.product.weight || undefined,
                            dimensions: item.product.dimensions || undefined,
                          }
                        }))}
                        zipCode={zipCode}
                        onZipCodeChange={setZipCode}
                        onShippingSelect={(price, service, deliveryTime) => {
                          setShippingPrice(price);
                          setSelectedShippingService(service);
                          setShippingDeliveryTime(deliveryTime);
                        }}
                        selectedService={selectedShippingService || undefined}
                      />
                    ) : (
                      <p className="text-gray-600">Selecione um endereço para calcular o frete.</p>
                    )}
                  </div>
                )}

                {currentStep === 2 && (
                  <div className="space-y-6">
                    <h3 className="text-lg font-semibold font-playfair text-center">3. Método de Pagamento</h3>
                    
                    <RadioGroup value={paymentMethod} onValueChange={(value: PaymentMethod) => setPaymentMethod(value)}>
                      <div className="flex items-center space-x-2 p-3 border rounded-md">
                        <RadioGroupItem value="CREDIT_CARD" id="payment-credit-card" />
                        <Label htmlFor="payment-credit-card">Cartão de Crédito</Label>
                      </div>
                      <div className="flex items-center space-x-2 p-3 border rounded-md">
                        <RadioGroupItem value="PIX" id="payment-pix" />
                        <Label htmlFor="payment-pix">PIX</Label>
                      </div>
                      <div className="flex items-center space-x-2 p-3 border rounded-md">
                        <RadioGroupItem value="BOLETO" id="payment-boleto" />
                        <Label htmlFor="payment-boleto">Boleto Bancário</Label>
                      </div>
                    </RadioGroup>

                    {paymentMethod === 'CREDIT_CARD' && (
                      <div className="mt-4 p-4 border rounded-md bg-gray-50">
                        <p className="text-sm text-gray-700">
                          Para uma integração real de cartão de crédito, você usaria um SDK de gateway de pagamento (ex: PagSeguro Checkout Transparente) aqui para coletar os dados do cartão de forma segura e gerar um token.
                        </p>
                        <p className="text-sm text-gray-700 mt-2">
                          Por enquanto, o pagamento será simulado no backend.
                        </p>
                      </div>
                    )}

                    {paymentMethod === 'PIX' && (
                      <div className="mt-4 p-4 space-y-4 border rounded-md bg-gray-50">
                        <p className="text-sm text-gray-700">
                          Ao finalizar o pedido, um QR Code PIX será gerado para pagamento. Por favor, insira seu CPF para emissão da cobrança.
                        </p>
                        <div>
                          <Label htmlFor="cpf" className="font-semibold text-sm">CPF do Pagador</Label>
                          <Input
                            id="cpf"
                            type="text"
                            placeholder="000.000.000-00"
                            value={cpf}
                            onChange={(e) => setCpf(e.target.value)}
                            className="mt-1"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {currentStep === 3 && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold font-playfair">4. Revisar Pedido</h3>
                    <div className="space-y-4 p-4 bg-gray-50 rounded-lg font-montserrat">
                      <h4 className="font-semibold">Endereço de Entrega:</h4>
                      {selectedAddress ? (
                        <>
                          <p>{selectedAddress.street}, {selectedAddress.number} {selectedAddress.complement && `- ${selectedAddress.complement}`}</p>
                          <p>{selectedAddress.neighborhood}, {selectedAddress.city} - {selectedAddress.state}, {selectedAddress.zipCode}</p>
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
                        src={item.product.imageUrl}
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