import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { MapPin, CreditCard, Truck, ShoppingBag, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useCart } from '@/hooks/use-cart';
import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';
import WhatsAppButton from '@/components/ui/whatsapp-button';
import FrontendShippingCalculator from '@/components/shipping/frontend-shipping-calculator';
import { useLocation } from 'wouter';

export default function Checkout() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { items, total, clearCart } = useCart();
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  // Redirecionar se carrinho vazio
  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-white font-montserrat"> {/* Aplicado font-montserrat */}
        <Header />
        <div className="container mx-auto px-4 py-16 text-center">
          <ShoppingBag className="w-20 h-20 text-gray-400 mx-auto mb-6" />
          <h1 className="text-2xl font-bold text-gray-900 mb-4 font-playfair">Carrinho Vazio</h1> {/* Aplicado font-playfair */}
          <p className="text-gray-600 mb-8 font-montserrat">Adicione produtos ao carrinho para continuar</p> {/* Aplicado font-montserrat */}
          <Button 
            onClick={() => setLocation('/')}
            className="bg-gray-900 hover:bg-black text-white rounded-xl px-8 py-3 font-montserrat" // Aplicado font-montserrat
          >
            Continuar Comprando
          </Button>
        </div>
        <Footer />
      </div>
    );
  }
  
  const [formData, setFormData] = useState({
    // Dados pessoais
    name: '',
    email: '',
    phone: '',
    
    // Endereço
    zipCode: '',
    street: '',
    number: '',
    complement: '',
    neighborhood: '',
    city: '',
    state: '',
    
    // Entrega
    shippingMethod: 'standard'
  });

  // Estados para o frete
  const [shippingPrice, setShippingPrice] = useState(0);
  const [selectedShippingService, setSelectedShippingService] = useState('');
  const [shippingDeliveryTime, setShippingDeliveryTime] = useState(0);

  const steps = [
    { id: 1, title: 'Dados Pessoais', icon: MapPin },
    { id: 2, title: 'Endereço', icon: MapPin },
    { id: 3, title: 'Pagamento', icon: CreditCard },
    { id: 4, title: 'Revisão', icon: Check }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    try {
      // Simular processamento do pedido
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      clearCart();
      
      toast({
        title: "Pedido realizado com sucesso!",
        description: "Você será redirecionado para a página de confirmação.",
      });
      
      setLocation('/order-success');
    } catch (error) {
      toast({
        title: "Erro no processamento",
        description: "Ocorreu um erro ao processar seu pedido. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const nextStep = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 font-montserrat"> {/* Aplicado font-montserrat */}
        <Header />
        <div className="container mx-auto px-4 py-16">
          <div className="text-center">
            <ShoppingBag className="w-24 h-24 text-gray-300 mx-auto mb-6" />
            <h1 className="text-3xl font-bold text-gray-800 mb-4 font-playfair">Seu carrinho está vazio</h1> {/* Aplicado font-playfair */}
            <p className="text-gray-600 mb-8 font-montserrat"> {/* Aplicado font-montserrat */}
              Adicione alguns produtos ao seu carrinho para continuar com o checkout.
            </p>
            <Button
              onClick={() => setLocation('/products')}
              className="bg-gradient-to-r from-gray-800 to-black hover:from-gray-900 hover:to-gray-800 text-white px-8 py-3 font-montserrat" // Aplicado font-montserrat
            >
              Ver Produtos
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 font-montserrat"> {/* Aplicado font-montserrat como padrão para o corpo */}
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-4 font-playfair">Finalizar Compra</h1> {/* Aplicado font-playfair */}
          
          {/* Progress Steps */}
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
                } font-montserrat`}> {/* Aplicado font-montserrat */}
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
          {/* Formulário */}
          <div className="lg:col-span-2">
            <Card className="shadow-lg border-0">
              <CardHeader>
                <CardTitle className="font-playfair">Informações de Entrega e Pagamento</CardTitle> {/* Aplicado font-playfair */}
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Dados Pessoais */}
                  {currentStep === 1 && (
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold font-playfair">Dados Pessoais</h3> {/* Aplicado font-playfair */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="name" className="font-montserrat">Nome completo</Label> {/* Aplicado font-montserrat */}
                          <Input
                            id="name"
                            value={formData.name}
                            onChange={(e) => setFormData({...formData, name: e.target.value})}
                            className="border-gray-200 focus:border-gray-500 focus:ring-gray-500 font-montserrat" // Aplicado font-montserrat
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="email" className="font-montserrat">Email</Label> {/* Aplicado font-montserrat */}
                          <Input
                            id="email"
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData({...formData, email: e.target.value})}
                            className="border-gray-200 focus:border-gray-500 focus:ring-gray-500 font-montserrat" // Aplicado font-montserrat
                            required
                          />
                        </div>
                        <div className="md:col-span-2">
                          <Label htmlFor="phone" className="font-montserrat">Telefone</Label> {/* Aplicado font-montserrat */}
                          <Input
                            id="phone"
                            value={formData.phone}
                            onChange={(e) => setFormData({...formData, phone: e.target.value})}
                            className="border-gray-200 focus:border-gray-500 focus:ring-gray-500 font-montserrat" // Aplicado font-montserrat
                            required
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Endereço */}
                  {currentStep === 2 && (
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold font-playfair">Endereço de Entrega</h3> {/* Aplicado font-playfair */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <Label htmlFor="zipCode" className="font-montserrat">CEP</Label> {/* Aplicado font-montserrat */}
                          <Input
                            id="zipCode"
                            value={formData.zipCode}
                            onChange={(e) => setFormData({...formData, zipCode: e.target.value})}
                            className="border-gray-200 focus:border-gray-500 focus:ring-gray-500 font-montserrat" // Aplicado font-montserrat
                            required
                          />
                        </div>
                        <div className="md:col-span-2">
                          <Label htmlFor="street" className="font-montserrat">Rua</Label> {/* Aplicado font-montserrat */}
                          <Input
                            id="street"
                            value={formData.street}
                            onChange={(e) => setFormData({...formData, street: e.target.value})}
                            className="border-gray-200 focus:border-gray-500 focus:ring-gray-500 font-montserrat" // Aplicado font-montserrat
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="number" className="font-montserrat">Número</Label> {/* Aplicado font-montserrat */}
                          <Input
                            id="number"
                            value={formData.number}
                            onChange={(e) => setFormData({...formData, number: e.target.value})}
                            className="border-gray-200 focus:border-gray-500 focus:ring-gray-500 font-montserrat" // Aplicado font-montserrat
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="complement" className="font-montserrat">Complemento</Label> {/* Aplicado font-montserrat */}
                          <Input
                            id="complement"
                            value={formData.complement}
                            onChange={(e) => setFormData({...formData, complement: e.target.value})}
                            className="border-gray-200 focus:border-gray-500 focus:ring-gray-500 font-montserrat" // Aplicado font-montserrat
                          />
                        </div>
                        <div>
                          <Label htmlFor="neighborhood" className="font-montserrat">Bairro</Label> {/* Aplicado font-montserrat */}
                          <Input
                            id="neighborhood"
                            value={formData.neighborhood}
                            onChange={(e) => setFormData({...formData, neighborhood: e.target.value})}
                            className="border-gray-200 focus:border-gray-500 focus:ring-gray-500 font-montserrat" // Aplicado font-montserrat
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="city" className="font-montserrat">Cidade</Label> {/* Aplicado font-montserrat */}
                          <Input
                            id="city"
                            value={formData.city}
                            onChange={(e) => setFormData({...formData, city: e.target.value})}
                            className="border-gray-200 focus:border-gray-500 focus:ring-gray-500 font-montserrat" // Aplicado font-montserrat
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="state" className="font-montserrat">Estado</Label> {/* Aplicado font-montserrat */}
                          <Input
                            id="state"
                            value={formData.state}
                            onChange={(e) => setFormData({...formData, state: e.target.value})}
                            className="border-gray-200 focus:border-gray-500 focus:ring-gray-500 font-montserrat" // Aplicado font-montserrat
                            required
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Pagamento */}
                  {currentStep === 3 && (
                    <div className="space-y-6">
                      <h3 className="text-lg font-semibold font-playfair text-center">Pagamento via Nubank</h3>
                      
                      <div className="flex flex-col items-center space-y-4 bg-purple-50 p-6 rounded-lg border border-purple-100">
                        {/* Logo do Nubank */}
                        <div className="w-32 h-20 flex items-center justify-center">
                          <img
                            src="/images/nubank.jpg"
                            alt="Nubank"
                            className="max-w-full max-h-full object-contain"
                          />
                        </div>
                        
                        {/* Informações do pagamento */}
                        <div className="text-center space-y-2">
                          <p className="text-sm text-gray-600 font-montserrat">
                            Valor total: <span className="font-bold text-purple-700">R$ {(total + shippingPrice).toFixed(2)}</span>
                          </p>
                          <p className="text-xs text-gray-500 font-montserrat">
                            Pagamento seguro e rápido pelo Nubank
                          </p>
                        </div>
                        
                        {/* Botão de pagamento */}
                        <button
                          onClick={() => {
                            // Link de pagamento do Nubank (substitua pela URL real)
                            window.open('https://nubank.com.br/pagamento', '_blank');
                          }}
                          className="w-full max-w-xs bg-purple-600 hover:bg-purple-700 text-white font-montserrat font-semibold py-3 px-6 rounded-lg transition duration-200 ease-in-out transform hover:scale-105 shadow-lg"
                        >
                          Pagar com Nubank
                        </button>
                        
                        <div className="text-center">
                          <p className="text-xs text-gray-400 font-montserrat">
                            Você será redirecionado para a página segura do Nubank
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Revisão */}
                  {currentStep === 4 && (
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold font-playfair">Revisar Pedido</h3> {/* Aplicado font-playfair */}
                      <div className="space-y-4 p-4 bg-gray-50 rounded-lg font-montserrat"> {/* Aplicado font-montserrat */}
                        <p><strong>Nome:</strong> {formData.name}</p>
                        <p><strong>Email:</strong> {formData.email}</p>
                        <p><strong>Endereço:</strong> {formData.street}, {formData.number} - {formData.neighborhood}, {formData.city}/{formData.state}</p>
                        <p><strong>Método de pagamento:</strong> Cartão de crédito terminado em {formData.cardNumber.slice(-4)}</p>
                      </div>
                    </div>
                  )}

                  {/* Navigation Buttons */}
                  <div className="flex justify-between pt-6">
                    {currentStep > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={prevStep}
                        className="border-gray-200 hover:bg-gray-50 font-montserrat" // Aplicado font-montserrat
                      >
                        Voltar
                      </Button>
                    )}
                    
                    {currentStep < 4 ? (
                      <Button
                        type="button"
                        onClick={nextStep}
                        className="ml-auto bg-gradient-to-r from-gray-800 to-black hover:from-gray-900 hover:to-gray-800 text-white font-montserrat" // Aplicado font-montserrat
                      >
                        Continuar
                      </Button>
                    ) : (
                      <Button
                        type="submit"
                        disabled={isProcessing}
                        className="ml-auto bg-gradient-to-r from-gray-800 to-black hover:from-gray-900 hover:to-gray-800 text-white px-8 py-3 font-montserrat" // Aplicado font-montserrat
                      >
                        {isProcessing ? 'Processando...' : 'Finalizar Pedido'}
                      </Button>
                    )}
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Resumo do Pedido */}
          <div>
            <Card className="shadow-xl border-0 sticky top-6 bg-white">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-gray-900 font-playfair"> {/* Aplicado font-playfair */}
                  <ShoppingBag className="h-5 w-5" />
                  Resumo do Pedido ({items.length} {items.length === 1 ? 'item' : 'itens'})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Lista de produtos */}
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {items.map((item) => (
                    <div key={item.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
                      <img
                        src={item.product.imageUrl}
                        alt={item.product.name}
                        className="w-14 h-14 object-cover rounded-lg bg-white shadow-sm"
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-sm text-gray-900 line-clamp-1 font-playfair"> {/* Aplicado font-playfair */}
                          {item.product.name}
                        </h4>
                        <p className="text-xs text-gray-500 mt-1 font-montserrat"> {/* Aplicado font-montserrat */}
                          {item.size && `Tamanho: ${item.size}`}
                          {item.color && ` • Cor: ${item.color}`}
                        </p>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-xs text-gray-600 font-montserrat">Qtd: {item.quantity}</span> {/* Aplicado font-montserrat */}
                          <span className="text-sm font-bold text-gray-900 font-montserrat"> {/* Aplicado font-montserrat */}
                            R$ {(item.product.price * item.quantity).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <Separator />

                <div className="space-y-3 font-montserrat"> {/* Aplicado font-montserrat */}
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Subtotal</span>
                    <span>R$ {total.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Frete</span>
                    <span className={shippingPrice > 0 ? 'text-gray-900 font-semibold' : 'text-gray-500'}>
                      {shippingPrice > 0 ? `R$ ${shippingPrice.toFixed(2)}` : 'Selecione opção'}
                    </span>
                  </div>
                  
                  {/* Calculadora de frete integrada */}
                  <FrontendShippingCalculator
                    items={items.map(item => ({
                      id: item.id.toString(),
                      product: {
                        id: item.product.id.toString(),
                        name: item.product.name,
                        price: item.product.price,
                        weight: item.product.weight || 0.3,
                        dimensions: item.product.dimensions || { length: 20, width: 15, height: 5 }
                      },
                      quantity: item.quantity
                    }))}
                    zipCode={formData.zipCode}
                    onZipCodeChange={(zipCode) => setFormData({...formData, zipCode })}
                    onShippingSelect={(price, service, deliveryTime) => {
                      setShippingPrice(price);
                      setSelectedShippingService(service);
                      setShippingDeliveryTime(deliveryTime);
                    }}
                    selectedService={selectedShippingService}
                  />
                </div>
                
                <Separator className="bg-gray-300" />
                
                <div className="flex justify-between items-center font-montserrat"> {/* Aplicado font-montserrat */}
                  <span className="text-lg font-bold text-gray-900">Total</span>
                  <span className="text-2xl font-bold text-gray-900">
                    R$ {(total + shippingPrice).toFixed(2)}
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