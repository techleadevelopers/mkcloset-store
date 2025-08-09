import { useState, useEffect } from 'react';
import { Check, ShoppingBag, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useUIStore } from '@/lib/store';
import { Product } from '@/types/backend'; // <--- CORRIGIDO: Importa o tipo de produto real

interface CartNotificationProps {
  isVisible: boolean;
  product: Product | null; // <--- CORRIGIDO: Agora usa o tipo Product
  onClose: () => void;
}

export default function CartNotification({ isVisible, product, onClose }: CartNotificationProps) {
  const { setIsCartOpen } = useUIStore();
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isVisible) {
      setIsAnimating(true);
      // Auto-close após 4 segundos
      const timer = setTimeout(() => {
        handleClose();
      }, 4000);
      
      return () => clearTimeout(timer);
    }
  }, [isVisible]);

  const handleClose = () => {
    setIsAnimating(false);
    setTimeout(onClose, 300); // Aguarda animação terminar
  };

  const handleViewCart = () => {
    setIsCartOpen(true);
    handleClose();
  };

  if (!isVisible || !product) return null;

  // <--- CORRIGIDO AQUI: A URL agora é buscada do array 'images' do produto
  const imageUrl = product.images?.[0] || 'https://placehold.co/600x800/e2e8f0/ffffff?text=Sem+Imagem';
  
  return (
    <div className={`
      fixed top-4 right-4 z-50 max-w-sm w-full
      transform transition-all duration-500 ease-out
      ${isAnimating 
        ? 'translate-x-0 opacity-100 scale-100' 
        : 'translate-x-full opacity-0 scale-95'
      }
    `}>
      <div className="bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden">
        {/* Header */}
        <div className="bg-green-50 px-4 py-3 border-b border-green-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                <Check className="w-4 h-4 text-white" />
              </div>
              <span className="font-semibold text-green-800">Produto Adicionado!</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
              className="h-6 w-6 p-0 hover:bg-green-100 text-green-600"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Product Info */}
        <div className="p-4">
          <div className="flex space-x-3">
            <img
              src={imageUrl} // <--- CORRIGIDO AQUI
              alt={product.name}
              className="w-16 h-16 object-cover rounded-lg bg-gray-100"
            />
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-900 line-clamp-1 text-sm">
                {product.name}
              </h3>
              {/* O tipo de mock não tinha category. Com o tipo real do backend, isso pode ser ajustado */}
              {product.category && ( 
                <p className="text-xs text-gray-500 mt-1">
                  {product.category.name}
                </p>
              )}
              <p className="text-sm font-bold text-gray-900 mt-1">
                R$ {product.price.toFixed(2)}
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex space-x-2 mt-4">
            <Button
              variant="outline"
              size="sm"
              onClick={handleClose}
              className="flex-1 border-gray-200 hover:bg-gray-50 text-gray-700 rounded-lg"
            >
              Continuar Comprando
            </Button>
            <Button
              size="sm"
              onClick={handleViewCart}
              className="flex-1 bg-gray-900 hover:bg-black text-white rounded-lg"
            >
              <ShoppingBag className="w-4 h-4 mr-2" />
              Ver Carrinho
            </Button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="h-1 bg-gray-100">
          <div 
            className="h-1 bg-green-500 transition-all duration-4000 ease-linear"
            style={{
              width: isAnimating ? '0%' : '100%',
              animation: isAnimating ? 'progress 4s linear forwards' : 'none'
            }}
          />
        </div>
      </div>
    </div>
  );
}
