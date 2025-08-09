import { X, CreditCard, ArrowRight, ShoppingBag, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetOverlay, SheetDescription } from '@/components/ui/sheet'; // Importe SheetDescription
import { Separator } from '@/components/ui/separator';
import { useCart } from '@/hooks/use-cart';
import { useUIStore } from '@/lib/store';
import { useLocation } from 'wouter';
import CartItemComponent from './cart-item';
import { Skeleton } from '@/components/ui/skeleton';

export default function ShoppingCart() {
  const { items, total, isLoading } = useCart();
  const { isCartOpen, setIsCartOpen } = useUIStore();
  const [, setLocation] = useLocation();

  const handleCheckout = () => {
    setIsCartOpen(false);
    setLocation('/checkout');
  };

  const handleClose = () => {
    setIsCartOpen(false);
  };

  return (
    <Sheet open={isCartOpen} onOpenChange={setIsCartOpen}>
      <SheetContent side="right" className="w-full max-w-md bg-white border-l border-gray-200 shadow-2xl"
      >
        <SheetHeader>
          <div className="flex items-center justify-between">
            <SheetTitle>Carrinho ({items.length})</SheetTitle>
            <Button variant="ghost" size="sm" onClick={handleClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          {/* Adicione SheetDescription aqui para acessibilidade */}
          <SheetDescription className="sr-only">
            Conteúdo do seu carrinho de compras, incluindo itens e total.
          </SheetDescription>
        </SheetHeader>

        <div className="flex flex-col h-full">
          {/* Cart Items */}
          <div className="flex-1 overflow-y-auto py-6">
            {isLoading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex items-center space-x-4">
                    <Skeleton className="w-16 h-20 rounded-lg" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-3 w-1/2" />
                      <Skeleton className="h-4 w-1/3" />
                    </div>
                  </div>
                ))}
              </div>
            ) : items.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-400 mb-4">
                  <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Seu carrinho está vazio</h3>
                <p className="text-gray-600 mb-6">Adicione alguns produtos incríveis!</p>
                <Button onClick={() => setIsCartOpen(false)}>
                  Continuar Comprando
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {items.map((item) => (
                  <CartItemComponent key={item.id} item={item} />
                ))}
              </div>
            )}
          </div>

          {/* Cart Footer */}
          {items.length > 0 && (
            <div className="border-t pt-6 space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold text-gray-900">Total:</span>
                <span className="text-2xl font-bold text-gray-900">
                  R$ {total.toFixed(2).replace('.', ',')}
                </span>
              </div>
              
              <Button
                onClick={handleCheckout}
                className="w-full bg-gray-900 hover:bg-black text-white hover:shadow-2xl transition-all duration-500 py-6 text-lg font-semibold rounded-xl group relative overflow-hidden"
              >
                <div className="flex items-center justify-center space-x-3 relative z-10">
                  <Lock className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
                  <span>Finalizar Compra</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
                </div>
                <div className="absolute inset-0 bg-gradient-to-r from-gray-800 to-gray-900 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </Button>
              
              {total < 199 && (
                <p className="text-sm text-gray-600 text-center">
                  Faltam R$ {(199 - total).toFixed(2).replace('.', ',')} para frete grátis
                </p>
              )}
              
              {total >= 199 && (
                <p className="text-sm text-green-600 text-center font-medium">
                  🎉 Você tem frete grátis!
                </p>
              )}
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}