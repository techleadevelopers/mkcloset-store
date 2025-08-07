// components/product/product-card.tsx

import { useState, useEffect } from 'react';
import { Heart, Plus, Check, Loader2, Eye, Star } from 'lucide-react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import CartNotification from '@/components/ui/cart-notification';
import { useCart } from '@/hooks/use-cart';
import { useWishlist } from '@/hooks/use-wishlist';
import { Product } from '@/types/backend'; // Importa a interface Product do backend

interface ProductCardProps {
  product: Product;
  className?: string;
}

export default function ProductCard({ product, className = "" }: ProductCardProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [justAdded, setJustAdded] = useState(false);
  const [showNotification, setShowNotification] = useState(false);

  const { addToCart, items, isLoading: isAddingToCart } = useCart(); // isAddingToCart agora vem do hook
  const { isInWishlist, toggleWishlist } = useWishlist();

  const inWishlist = isInWishlist(product.id);
  const isInCart = items.some(item => item.productId === product.id);

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault(); // Prevenir navegação do Link
    e.stopPropagation(); // Parar propagação do evento
    
    if (justAdded) return;

    // isAddingToCart já é controlado pelo hook useCart
    // setJustAdded(false); // Removido, pois o estado de 'justAdded' é definido após o sucesso da mutação

    try {
      await addToCart(product.id);
      setJustAdded(true);
      setShowNotification(true);

      // Reset após 3 segundos
      setTimeout(() => {
        setJustAdded(false);
      }, 3000);
    } catch (error) {
      console.error('Erro ao adicionar ao carrinho:', error);
    }
  };

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevenir navegação do Link
    e.stopPropagation(); // Parar propagação do evento
    toggleWishlist(product.id);
  };

  return (
    <>
      <CartNotification 
        isVisible={showNotification}
        product={product}
        onClose={() => setShowNotification(false)}
      />
      
      <div className={`group relative ${className}`}>
        <div className="bg-white rounded-2xl shadow-sm hover:shadow-2xl transition-all duration-500 ease-out hover:-translate-y-2 border-0 overflow-hidden">
          
          {/* Image Container - Clicável para navegar */}
          <Link href={`/product/${product.id}`} className="block">
            <div className="relative overflow-hidden bg-gray-50 rounded-t-2xl aspect-[3/4] cursor-pointer">
              {!imageLoaded && (
                <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200 animate-pulse" />
              )}
              <img
                src={product.imageUrl}
                alt={product.name}
                className={`w-full h-full object-cover transition-all duration-700 group-hover:scale-110 ${
                  imageLoaded ? 'opacity-100' : 'opacity-0'
                }`}
                onLoad={() => setImageLoaded(true)}
                loading="lazy"
              />
              
              {/* Badges */}
              <div className="absolute top-3 left-3 flex flex-col gap-2 z-10">
                {product.isNew && (
                  <Badge className="bg-gray-900 text-white text-xs font-medium px-2 py-1 shadow-lg">
                    Novo
                  </Badge>
                )}
                {product.discount && (
                  <Badge className="bg-red-500 text-white text-xs font-medium px-2 py-1 shadow-lg">
                    -{product.discount}%
                  </Badge>
                )}
              </div>

              {/* Action Buttons */}
              <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0 z-10">
                <Button
                  size="sm"
                  variant="secondary"
                  className="h-10 w-10 rounded-full shadow-lg bg-white/90 backdrop-blur-sm hover:bg-white border-0"
                  onClick={handleWishlistToggle}
                >
                  <Heart 
                    className={`h-4 w-4 transition-colors ${
                      inWishlist ? 'fill-red-500 text-red-500' : 'text-gray-600'
                    }`} 
                  />
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  className="h-10 w-10 rounded-full shadow-lg bg-white/90 backdrop-blur-sm hover:bg-white border-0"
                >
                  <Eye className="h-4 w-4 text-gray-600" />
                </Button>
              </div>

              {/* Quick Add Button */}
              <div className="absolute bottom-4 left-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0 z-10">
                <Button
                  onClick={handleAddToCart}
                  disabled={isAddingToCart || justAdded}
                  className={`
                    w-full rounded-xl shadow-lg backdrop-blur-sm border-0 py-3 
                    transition-all duration-500 font-semibold
                    ${justAdded 
                      ? 'bg-green-600 hover:bg-green-600 text-white scale-105' 
                      : isInCart
                      ? 'bg-gray-600 hover:bg-gray-700 text-white'
                      : 'bg-gray-900 hover:bg-black text-white hover:scale-105'
                    }
                  `}
                >
                  {isAddingToCart ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Adicionando...
                    </>
                  ) : justAdded ? (
                    <>
                      <Check className="h-4 w-4 mr-2 animate-bounce" />
                      Adicionado!
                    </>
                  ) : isInCart ? (
                    <>
                      <Check className="h-4 w-4 mr-2" />
                      No Carrinho
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4 mr-2 transition-transform group-hover:scale-110" />
                      Adicionar
                    </>
                  )}
                </Button>
              </div>
            </div>
          </Link>

          {/* Product Info - Clicável para navegar */}
          <Link href={`/product/${product.id}`} className="block">
            <div className="p-5 space-y-3 cursor-pointer">
              <div className="space-y-1">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {product.category?.name} {/* Acessa name da categoria */}
                </p>
                <h3 className="font-semibold text-gray-900 line-clamp-2 leading-tight hover:text-gray-700 transition-colors">
                  {product.name}
                </h3>
              </div>
              
              <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">
                {product.description}
              </p>

              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center space-x-2">
                  <span className="text-xl font-bold text-gray-900">
                    R$ {product.price.toFixed(2)}
                  </span>
                  {product.originalPrice && (
                    <span className="text-sm text-gray-500 line-through">
                      R$ {product.originalPrice.toFixed(2)}
                    </span>
                  )}
                </div>
                
                <div className="flex items-center space-x-1">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span className="text-sm text-gray-600">4.5</span>
                </div>
              </div>

              {/* Size indicators */}
              {product.sizes && product.sizes.length > 0 && (
                <div className="flex items-center space-x-1">
                  <span className="text-xs text-gray-500">Tamanhos:</span>
                  <div className="flex space-x-1">
                    {product.sizes.slice(0, 4).map((size, index) => (
                      <span key={index} className="text-xs bg-gray-100 px-2 py-1 rounded">
                        {size}
                      </span>
                    ))}
                    {product.sizes.length > 4 && (
                      <span className="text-xs text-gray-500">+{product.sizes.length - 4}</span>
                    )}
                  </div>
                </div>
              )}
            </div>
          </Link>
        </div>
      </div>
    </>
  );
}