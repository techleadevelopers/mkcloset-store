import { Heart, ShoppingBag, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';
import { useWishlist } from '@/hooks/use-wishlist';
import { useCart } from '@/hooks/use-cart';
import { useToast } from '@/hooks/use-toast';
import { useLocation } from 'wouter';
import { Product } from '@/types/backend';
import { Skeleton } from '@/components/ui/skeleton'; // Importação adicionada

export default function Wishlist() {
  const [, setLocation] = useLocation();
  const { items, removeFromWishlist, isLoading: isLoadingWishlist } = useWishlist();
  const { addToCart } = useCart();
  const { toast } = useToast();

  const handleAddToCart = (product: Product) => {
    addToCart(product.id);
    toast({
      title: "Produto adicionado",
      description: `${product.name} adicionado ao carrinho!`,
    });
  };

  const handleRemoveFromWishlist = (productId: string) => {
    removeFromWishlist(productId);
  };

  if (isLoadingWishlist) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <Header />
        <div className="container mx-auto px-4 py-16 text-center">
          <Skeleton className="w-24 h-24 rounded-full mx-auto mb-6" />
          <Skeleton className="h-8 w-1/2 mx-auto mb-4" />
          <Skeleton className="h-4 w-3/4 mx-auto mb-8" />
          <Skeleton className="h-12 w-48 mx-auto" />
        </div>
        <Footer />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <Header />
        <div className="container mx-auto px-4 py-16">
          <div className="text-center">
            <Heart className="w-24 h-24 text-gray-300 mx-auto mb-6" />
            <h1 className="text-3xl font-bold text-gray-800 mb-4">Sua wishlist está vazia</h1>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              Adicione produtos que você gosta à sua lista de desejos para encontrá-los facilmente depois!
            </p>
            <Button
              onClick={() => setLocation('/products')}
              className="bg-gradient-to-r from-gray-800 to-black hover:from-gray-900 hover:to-gray-800 text-white px-8 py-3"
            >
              Explorar Produtos
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
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Minha Wishlist</h1>
          <p className="text-gray-600">
            {items.length} {items.length === 1 ? 'item' : 'itens'} na sua lista de desejos
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {items.map((item) => (
            <Card key={item.id} className="group hover:shadow-lg transition-all duration-300">
              <div className="relative overflow-hidden">
                <img
                  src={item.product.imageUrl}
                  alt={item.product.name}
                  className="w-full h-64 object-cover transition-transform duration-300 group-hover:scale-105"
                />
                {item.product.isNew && (
                  <Badge className="absolute top-2 left-2 bg-gray-700 text-white">
                    Novo
                  </Badge>
                )}
                {item.product.discount && (
                  <Badge className="absolute top-2 right-2 bg-red-500 text-white">
                    -{item.product.discount}%
                  </Badge>
                )}
              </div>
              
              <CardContent className="p-4">
                <div className="space-y-3">
                  <div>
                    <h3 className="font-semibold text-gray-800 line-clamp-2">
                      {item.product.name}
                    </h3>
                    <p className="text-sm text-gray-600">{item.product.category?.name}</p>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      {item.product.originalPrice && (
                        <span className="text-sm text-gray-400 line-through">
                          R$ {item.product.originalPrice.toFixed(2)}
                        </span>
                      )}
                      <span className="text-lg font-bold text-gray-800">
                        R$ {item.product.price.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    <Button
                      onClick={() => handleAddToCart(item.product)}
                      className="flex-1 bg-gradient-to-r from-gray-800 to-black hover:from-gray-900 hover:to-gray-800 text-white"
                      size="sm"
                    >
                      <ShoppingBag className="w-4 h-4 mr-1" />
                      Adicionar
                    </Button>
                    <Button
                      onClick={() => handleRemoveFromWishlist(item.productId)}
                      variant="outline"
                      size="sm"
                      className="border-red-200 text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-12 text-center">
          <Button
            onClick={() => setLocation('/products')}
            variant="outline"
            className="border-gray-200 hover:bg-gray-50"
          >
            Continuar Comprando
          </Button>
        </div>
      </div>
      <Footer />
    </div>
  );
}