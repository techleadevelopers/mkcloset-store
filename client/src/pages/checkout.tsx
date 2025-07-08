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
      <div className="min-h-screen bg-white">
        <Header />
        <div className="container mx-auto px-4 py-16 text-center">
          <ShoppingBag className="w-20 h-20 text-gray-400 mx-auto mb-6" />
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Carrinho Vazio</h1>
          <p className="text-gray-600 mb-8">Adicione produtos ao carrinho para continuar</p>
          <Button 
            onClick={() => setLocation('/')}
            className="bg-gray-900 hover:bg-black text-white rounded-xl px-8 py-3"
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
    
    // Pagamento
    cardNumber: '',
    cardName: '',
    expiryDate: '',
    cvv: '',
    
    // Entrega
    shippingMethod: 'standard'
  });

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
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <Header />
        <div className="container mx-auto px-4 py-16">
          <div className="text-center">
            <ShoppingBag className="w-24 h-24 text-gray-300 mx-auto mb-6" />
            <h1 className="text-3xl font-bold text-gray-800 mb-4">Seu carrinho está vazio</h1>
            <p className="text-gray-600 mb-8">
              Adicione alguns produtos ao seu carrinho para continuar com o checkout.
            </p>
            <Button
              onClick={() => setLocation('/products')}
              className="bg-gradient-to-r from-gray-800 to-black hover:from-gray-900 hover:to-gray-800 text-white px-8 py-3"
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">Finalizar Compra</h1>
          
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
                }`}>
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
                <CardTitle>Informações de Entrega e Pagamento</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Dados Pessoais */}
                  {currentStep === 1 && (
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Dados Pessoais</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="name">Nome completo</Label>
                          <Input
                            id="name"
                            value={formData.name}
                            onChange={(e) => setFormData({...formData, name: e.target.value})}
                            className="border-gray-200 focus:border-gray-500 focus:ring-gray-500"
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="email">Email</Label>
                          <Input
                            id="email"
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData({...formData, email: e.target.value})}
                            className="border-gray-200 focus:border-gray-500 focus:ring-gray-500"
                            required
                          />
                        </div>
                        <div className="md:col-span-2">
                          <Label htmlFor="phone">Telefone</Label>
                          <Input
                            id="phone"
                            value={formData.phone}
                            onChange={(e) => setFormData({...formData, phone: e.target.value})}
                            className="border-gray-200 focus:border-gray-500 focus:ring-gray-500"
                            required
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Endereço */}
                  {currentStep === 2 && (
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Endereço de Entrega</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <Label htmlFor="zipCode">CEP</Label>
                          <Input
                            id="zipCode"
                            value={formData.zipCode}
                            onChange={(e) => setFormData({...formData, zipCode: e.target.value})}
                            className="border-gray-200 focus:border-gray-500 focus:ring-gray-500"
                            required
                          />
                        </div>
                        <div className="md:col-span-2">
                          <Label htmlFor="street">Rua</Label>
                          <Input
                            id="street"
                            value={formData.street}
                            onChange={(e) => setFormData({...formData, street: e.target.value})}
                            className="border-gray-200 focus:border-gray-500 focus:ring-gray-500"
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="number">Número</Label>
                          <Input
                            id="number"
                            value={formData.number}
                            onChange={(e) => setFormData({...formData, number: e.target.value})}
                            className="border-gray-200 focus:border-gray-500 focus:ring-gray-500"
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="complement">Complemento</Label>
                          <Input
                            id="complement"
                            value={formData.complement}
                            onChange={(e) => setFormData({...formData, complement: e.target.value})}
                            className="border-gray-200 focus:border-gray-500 focus:ring-gray-500"
                          />
                        </div>
                        <div>
                          <Label htmlFor="neighborhood">Bairro</Label>
                          <Input
                            id="neighborhood"
                            value={formData.neighborhood}
                            onChange={(e) => setFormData({...formData, neighborhood: e.target.value})}
                            className="border-gray-200 focus:border-gray-500 focus:ring-gray-500"
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="city">Cidade</Label>
                          <Input
                            id="city"
                            value={formData.city}
                            onChange={(e) => setFormData({...formData, city: e.target.value})}
                            className="border-gray-200 focus:border-gray-500 focus:ring-gray-500"
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="state">Estado</Label>
                          <Input
                            id="state"
                            value={formData.state}
                            onChange={(e) => setFormData({...formData, state: e.target.value})}
                            className="border-gray-200 focus:border-gray-500 focus:ring-gray-500"
                            required
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Pagamento */}
                  {currentStep === 3 && (
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Dados do Cartão</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="md:col-span-2">
                          <Label htmlFor="cardNumber">Número do cartão</Label>
                          <Input
                            id="cardNumber"
                            value={formData.cardNumber}
                            onChange={(e) => setFormData({...formData, cardNumber: e.target.value})}
                            placeholder="**** **** **** ****"
                            className="border-gray-200 focus:border-gray-500 focus:ring-gray-500"
                            required
                          />
                        </div>
                        <div className="md:col-span-2">
                          <Label htmlFor="cardName">Nome no cartão</Label>
                          <Input
                            id="cardName"
                            value={formData.cardName}
                            onChange={(e) => setFormData({...formData, cardName: e.target.value})}
                            className="border-gray-200 focus:border-gray-500 focus:ring-gray-500"
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="expiryDate">Validade</Label>
                          <Input
                            id="expiryDate"
                            value={formData.expiryDate}
                            onChange={(e) => setFormData({...formData, expiryDate: e.target.value})}
                            placeholder="MM/AA"
                            className="border-gray-200 focus:border-gray-500 focus:ring-gray-500"
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="cvv">CVV</Label>
                          <Input
                            id="cvv"
                            value={formData.cvv}
                            onChange={(e) => setFormData({...formData, cvv: e.target.value})}
                            placeholder="***"
                            className="border-gray-200 focus:border-gray-500 focus:ring-gray-500"
                            required
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Revisão */}
                  {currentStep === 4 && (
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Revisar Pedido</h3>
                      <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
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
                        className="border-gray-200 hover:bg-gray-50"
                      >
                        Voltar
                      </Button>
                    )}
                    
                    {currentStep < 4 ? (
                      <Button
                        type="button"
                        onClick={nextStep}
                        className="ml-auto bg-gradient-to-r from-gray-800 to-black hover:from-gray-900 hover:to-gray-800 text-white"
                      >
                        Continuar
                      </Button>
                    ) : (
                      <Button
                        type="submit"
                        disabled={isProcessing}
                        className="ml-auto bg-gradient-to-r from-gray-800 to-black hover:from-gray-900 hover:to-gray-800 text-white px-8 py-3"
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
                <CardTitle className="flex items-center gap-2 text-gray-900">
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
                        <h4 className="font-semibold text-sm text-gray-900 line-clamp-1">
                          {item.product.name}
                        </h4>
                        <p className="text-xs text-gray-500 mt-1">
                          {item.size && `Tamanho: ${item.size}`}
                          {item.color && ` • Cor: ${item.color}`}
                        </p>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-xs text-gray-600">Qtd: {item.quantity}</span>
                          <span className="text-sm font-bold text-gray-900">
                            R$ {(item.product.price * item.quantity).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <Separator />

                <div className="space-y-3">
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Subtotal</span>
                    <span>R$ {total.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Frete</span>
                    <span className={total >= 199 ? 'text-green-600 font-semibold' : ''}>
                      {total >= 199 ? 'Grátis' : 'R$ 15,00'}
                    </span>
                  </div>
                  {total >= 199 && (
                    <div className="text-xs text-green-700 bg-green-50 p-3 rounded-lg border border-green-200">
                      🎉 Parabéns! Você ganhou frete grátis em compras acima de R$ 199,00
                    </div>
                  )}
                  {total < 199 && (
                    <div className="text-xs text-gray-600 bg-gray-50 p-3 rounded-lg border border-gray-200">
                      💡 Faltam apenas R$ {(199 - total).toFixed(2)} para ganhar frete grátis
                    </div>
                  )}
                </div>
                
                <Separator className="bg-gray-300" />
                
                <div className="flex justify-between items-center">
                  <span className="text-lg font-bold text-gray-900">Total</span>
                  <span className="text-2xl font-bold text-gray-900">
                    R$ {(total + (total >= 199 ? 0 : 15)).toFixed(2)}
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