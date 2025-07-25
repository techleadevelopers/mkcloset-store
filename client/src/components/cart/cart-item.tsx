import { Minus, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/hooks/use-cart';
import { type MockProduct } from '@/lib/mock-data';

interface CartItemProps {
  item: {
    id: number;
    productId: number;
    sessionId: string;
    quantity: number;
    size?: string;
    color?: string;
    product: MockProduct;
  };
}

export default function CartItemComponent({ item }: CartItemProps) {
  const { updateQuantity, removeFromCart } = useCart();

  const handleDecrease = () => {
    updateQuantity(item.id, (item.quantity || 1) - 1);
  };

  const handleIncrease = () => {
    updateQuantity(item.id, (item.quantity || 1) + 1);
  };

  const handleRemove = () => {
    removeFromCart(item.id);
  };

  const itemTotal = item.product.price * (item.quantity || 1);

  return (
    <div className="flex items-center space-x-4 py-4 border-b border-gray-100 last:border-b-0">
      <div className="w-16 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
        <img
          src={item.product.imageUrl}
          alt={item.product.name}
          className="w-full h-full object-cover"
        />
      </div>

      <div className="flex-1 min-w-0">
        <h4 className="font-medium text-gray-900 truncate">{item.product.name}</h4>
        {item.size && (
          <p className="text-sm text-gray-600">Tamanho: {item.size}</p>
        )}
        {item.color && (
          <p className="text-sm text-gray-600">Cor: {item.color}</p>
        )}
        <p className="text-purple-600 font-semibold">
          R$ {itemTotal.toFixed(2).replace('.', ',')}
        </p>
      </div>

      <div className="flex flex-col space-y-2">
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            className="w-8 h-8 p-0"
            onClick={handleDecrease}
          >
            <Minus className="h-3 w-3" />
          </Button>
          <span className="w-8 text-center text-sm font-medium">
            {item.quantity || 1}
          </span>
          <Button
            variant="outline"
            size="sm"
            className="w-8 h-8 p-0"
            onClick={handleIncrease}
          >
            <Plus className="h-3 w-3" />
          </Button>
        </div>
        
        <Button
          variant="ghost"
          size="sm"
          className="w-full text-red-500 hover:text-red-700 hover:bg-red-50"
          onClick={handleRemove}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
