// pages/order-success.tsx

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Package, Truck, CreditCard, Download, ArrowRight } from 'lucide-react';
import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';
import { useLocation } from 'wouter';
import { useQuery, QueryKey } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Order, OrderStatus, PaymentMethod } from '@/types/backend'; // Import PaymentMethod
import { Skeleton } from '@/components/ui/skeleton';

export default function OrderSuccess() {
  const [, setLocation] = useLocation();
  const queryParams = new URLSearchParams(window.location.search);
  const orderId = queryParams.get('orderId');
  const paymentUrl = queryParams.get('paymentUrl'); // Obter a paymentUrl
  const paymentMethodFromUrl = queryParams.get('paymentMethod') as PaymentMethod | null; // Obter o método de pagamento

  const { data: order, isLoading: isLoadingOrder, isError: isErrorOrder, refetch } = useQuery<Order, Error>({
    queryKey: ['order', orderId],
    queryFn: async () => {
      if (!orderId) {
        throw new Error("ID do pedido não fornecido.");
      }
      try {
        const res = await apiRequest('GET', `/orders/${orderId}`);
        if (!res.ok) {
            throw new Error(`Erro ao buscar pedido: ${res.statusText}`);
        }
        return res.json();
      } catch (err: unknown) {
        console.error("Erro ao carregar detalhes do pedido:", err);
        throw new Error("Não foi possível carregar os detalhes do pedido.");
      }
    },
    enabled: !!orderId && !!localStorage.getItem('access_token'),
    refetchInterval: (query) => {
      // Só faz polling se o pedido existir e o status for PENDING
      if (query.state.data && query.state.data.status === 'PENDING') {
        return 5000; // Faz polling a cada 5 segundos
      }
      return false; // Para o polling quando o status não for mais PENDING
    },
    staleTime: 1000 * 10, // Mantém os dados "frescos" por 10 segundos, então re-fetch no mount se não estiver fazendo polling
  });

  const getOrderStatusSteps = (currentStatus: OrderStatus) => {
    const steps = [
      { status: 'PENDING', title: 'Pedido confirmado', icon: CheckCircle },
      { status: 'PAID', title: 'Pagamento processado', icon: CreditCard },
      { status: 'SHIPPED', title: 'Enviado', icon: Truck },
      { status: 'DELIVERED', title: 'Entregue', icon: Package },
    ];

    let completedIndex = -1;
    for (let i = 0; i < steps.length; i++) {
      if (steps[i].status === currentStatus) {
        completedIndex = i;
        break;
      }
    }

    return steps.map((step, index) => ({
      ...step,
      completed: index <= completedIndex,
    }));
  };

  // ... (rest of the component remains the same) ...

  const orderSteps = order ? getOrderStatusSteps(order.status) : []; // Ensure order is not null
  const estimatedDeliveryDate = order ? new Date(order.createdAt) : new Date(); // Fallback for estimated delivery
  // Calculate estimated delivery based on shipping service
  if (order) {
    estimatedDeliveryDate.setDate(estimatedDeliveryDate.getDate() + (order.shippingService === '4014' ? 1 : 5)); // Assuming '4014' is a fast service
  }
  const estimatedDelivery = estimatedDeliveryDate.toLocaleDateString('pt-BR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });


  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Header />
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto">
          {/* Success Header */}
          <div className="text-center mb-8">
            <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-12 h-12 text-green-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              Pedido realizado com sucesso!
            </h1>
            <p className="text-gray-600 text-lg">
              Obrigada por escolher a MKcloset! Seu pedido está sendo processado.
            </p>
            {order && (order.paymentMethod === 'PIX' || order.paymentMethod === 'BOLETO') && order.status === 'PENDING' && (
              <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-800">
                <p className="font-semibold">Atenção:</p>
                <p>Seu pagamento via {order.paymentMethod} ainda está pendente. O status será atualizado automaticamente após a confirmação do pagamento.</p>
                {paymentUrl && (
                  <div className="mt-4">
                    {order.paymentMethod === 'PIX' && (
                      <>
                        <p className="mb-2">Escaneie o QR Code ou use o código Copia e Cola para pagar:</p>
                        <img src={paymentUrl} alt="QR Code PIX" className="mx-auto max-w-xs border rounded-lg p-2" />
                        <a href={paymentUrl} target="_blank" rel="noopener noreferrer" className="block text-center text-blue-600 hover:underline mt-2">Ver QR Code em nova aba</a>
                        {/* Se o backend retornar o BR Code, você pode exibi-lo aqui também */}
                        {/* <p className="mt-2 text-sm break-all">Código Copia e Cola: {order.brCode}</p> */}
                      </>
                    )}
                    {order.paymentMethod === 'BOLETO' && (
                      <>
                        <p className="mb-2">Clique para visualizar e pagar seu boleto:</p>
                        <a href={paymentUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg">
                          <Download className="w-4 h-4 mr-2" /> Visualizar Boleto
                        </a>
                      </>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Order Details */}
          {/* ... (rest of the Order Details card) ... */}
          <Card className="shadow-lg border-0 mb-6">
            <CardHeader className="bg-gradient-to-r from-gray-800 to-black text-white rounded-t-lg">
              <CardTitle className="text-center">
                Pedido #{order?.id.slice(-8).toUpperCase()} {/* Use optional chaining */}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-gray-800 mb-2">Detalhes do Pedido</h3>
                  <div className="space-y-2 text-sm text-gray-600">
                    <p><strong>Data:</strong> {order ? new Date(order.createdAt).toLocaleDateString('pt-BR') : 'N/A'}</p>
                    <p><strong>Previsão de entrega:</strong> {estimatedDelivery}</p>
                    <p><strong>Método de pagamento:</strong> {order ? (order.paymentMethod === 'CREDIT_CARD' ? 'Cartão de Crédito' : order.paymentMethod === 'PIX' ? 'PIX' : order.paymentMethod) : 'N/A'}</p>
                    <p><strong>Total:</strong> R$ {order ? order.totalAmount.toFixed(2).replace('.', ',') : 'N/A'}</p>
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800 mb-2">Endereço de Entrega</h3>
                  <div className="text-sm text-gray-600">
                    <p>{order?.shippingAddressStreet}, {order?.shippingAddressNumber}</p>
                    <p>{order?.shippingAddressComplement && `${order.shippingAddressComplement} - `}{order?.shippingAddressNeighborhood}</p>
                    <p>{order?.shippingAddressCity}, {order?.shippingAddressState} - {order?.shippingAddressZipCode}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Order Status */}
          {/* ... (rest of the Order Status card) ... */}
          <Card className="shadow-lg border-0 mb-6">
            <CardHeader>
              <CardTitle>Status do Pedido</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {orderSteps.map((step, index) => (
                  <div key={index} className="flex items-center space-x-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      step.completed
                        ? 'bg-green-100 text-green-600'
                        : 'bg-gray-100 text-gray-400'
                    }`}>
                      <step.icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <p className={`font-medium ${
                        step.completed ? 'text-green-600' : 'text-gray-400'
                      }`}>
                        {step.title}
                      </p>
                    </div>
                    {step.completed && (
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Next Steps */}
          {/* ... (rest of the Next Steps card) ... */}
          <Card className="shadow-lg border-0 mb-8">
            <CardHeader>
              <CardTitle>Próximos Passos</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-blue-600 font-bold text-sm">1</span>
                </div>
                <div>
                  <h4 className="font-medium text-gray-800">Confirmação por Email</h4>
                  <p className="text-sm text-gray-600">
                    Você receberá um email de confirmação com todos os detalhes do seu pedido.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-blue-600 font-bold text-sm">2</span>
                </div>
                <div>
                  <h4 className="font-medium text-gray-800">Preparação do Pedido</h4>
                  <p className="text-sm text-gray-600">
                    Nosso time começará a preparar seus itens em até 24 horas.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-blue-600 font-bold text-sm">3</span>
                </div>
                <div>
                  <h4 className="font-medium text-gray-800">Código de Rastreamento</h4>
                  <p className="text-sm text-gray-600">
                    Você receberá o código de rastreamento quando o pedido for enviado.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          {/* ... (rest of the Action Buttons) ... */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <Button
              variant="outline"
              className="w-full border-gray-200 hover:bg-gray-50"
              onClick={() => window.print()}
            >
              <Download className="w-4 h-4 mr-2" />
              Baixar Comprovante
            </Button>
            
            <Button
              variant="outline"
              className="w-full border-gray-200 hover:bg-gray-50"
              onClick={() => setLocation('/products')}
            >
              <ArrowRight className="w-4 h-4 mr-2" />
              Continuar Comprando
            </Button>
            
            <Button
              className="w-full bg-gradient-to-r from-gray-800 to-black hover:from-gray-900 hover:to-gray-800 text-white"
              onClick={() => setLocation('/')}
            >
              Voltar ao Início
            </Button>
          </div>

          {/* Customer Service */}
          {/* ... (rest of the Customer Service card) ... */}
          <Card className="shadow-lg border-0 bg-gradient-to-r from-pink-50 to-purple-50">
            <CardContent className="p-6 text-center">
              <h3 className="font-bold text-gray-800 mb-2">Precisa de ajuda?</h3>
              <p className="text-gray-600 mb-4">
                Nossa equipe está sempre pronta para ajudar você!
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="font-medium text-gray-800">WhatsApp</p>
                  <p className="text-pink-600">(11) 99999-9999</p>
                </div>
                <div>
                  <p className="font-medium text-gray-800">Email</p>
                  <p className="text-pink-600">atendimento@mkcloset.com</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      <Footer />
    </div>
  );
}