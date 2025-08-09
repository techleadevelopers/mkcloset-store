// components/product/product-card.tsx

import { useState, useEffect } from 'react';
import { Heart, Plus, Check, Loader2, Eye, Star } from 'lucide-react';
import { Link } from 'wouter'; // Importa o componente Link do wouter
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import CartNotification from '@/components/ui/cart-notification';
import { useCart } from '@/hooks/use-cart';
import { useWishlist } from '@/hooks/use-wishlist';
import { Product } from '@/types/backend'; // Importa a interface Product do backend

// Define as propriedades esperadas para o componente ProductCard.
interface ProductCardProps {
  product: Product; // O objeto completo do produto.
  className?: string; // Classes CSS adicionais para estilização.
}

export default function ProductCard({ product, className = "" }: ProductCardProps) {
  // Estados locais para controlar o carregamento da imagem, status de adição ao carrinho e notificação.
  const [imageLoaded, setImageLoaded] = useState(false);
  const [justAdded, setJustAdded] = useState(false); // Indica se o produto acabou de ser adicionado.
  const [showNotification, setShowNotification] = useState(false); // Controla a visibilidade da notificação.

  // Hooks personalizados para interagir com o carrinho e a lista de desejos.
  const { addToCart, items, isLoading: isAddingToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();

  // Verifica se o produto está na lista de desejos ou no carrinho.
  const inWishlist = isInWishlist(product.id);
  const isInCart = items.some(item => item.productId === product.id);

  // Lida com a adição do produto ao carrinho.
  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault(); // Previne a navegação padrão do Link.
    e.stopPropagation(); // Impede que o evento de clique se propague para o Link pai.
    
    if (justAdded) return; // Não faz nada se já estiver no processo de adição.

    try {
      await addToCart(product.id); // Adiciona o produto ao carrinho.
      setJustAdded(true); // Define o estado para indicar que foi adicionado.
      setShowNotification(true); // Exibe a notificação.

      // Reseta o estado 'justAdded' após 3 segundos.
      setTimeout(() => {
        setJustAdded(false);
      }, 3000);
    } catch (error) {
      console.error('Erro ao adicionar ao carrinho:', error);
      // Aqui você poderia adicionar um toast de erro se desejar.
    }
  };

  // Lida com a alternância do produto na lista de desejos.
  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.preventDefault(); // Previne a navegação padrão do Link.
    e.stopPropagation(); // Impede que o evento de clique se propague.
    toggleWishlist(product.id); // Alterna o status na lista de desejos.
  };

  // Define a URL da imagem a partir do primeiro item do array 'images' do produto.
  // Adiciona um fallback para uma imagem de placeholder caso o array esteja vazio ou não exista.
  const imageUrl = product.images?.[0] || 'https://placehold.co/600x800/e2e8f0/ffffff?text=Sem+Imagem';

  return (
    <>
      {/* Componente de notificação do carrinho */}
      <CartNotification 
        isVisible={showNotification}
        product={product}
        onClose={() => setShowNotification(false)}
      />
      
      {/* Container principal do card do produto */}
      <div className={`group relative ${className}`}>
        <div className="bg-white rounded-2xl shadow-sm hover:shadow-2xl transition-all duration-500 ease-out hover:-translate-y-2 border-0 overflow-hidden">
          
          {/* Container da Imagem - Clicável para navegar para a página de detalhes do produto */}
          <Link href={`/product/${product.id}`} className="block">
            <div className="relative overflow-hidden bg-gray-50 rounded-t-2xl aspect-[3/4] cursor-pointer">
              {/* Esqueleto (skeleton loader) enquanto a imagem carrega */}
              {!imageLoaded && (
                <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200 animate-pulse" />
              )}
              {/* Imagem do produto */}
              <img
                src={imageUrl}
                alt={product.name}
                className={`w-full h-full object-cover transition-all duration-700 group-hover:scale-110 ${
                  imageLoaded ? 'opacity-100' : 'opacity-0'
                }`}
                onLoad={() => setImageLoaded(true)} // Define imageLoaded como true quando a imagem carrega.
                loading="lazy" // Carregamento preguiçoso para otimização.
              />
              
              {/* Badges de Novo e Desconto */}
              <div className="absolute top-3 left-3 flex flex-col gap-2 z-10">
                {product.isNew && (
                  <Badge className="bg-gray-900 text-white text-xs font-medium px-2 py-1 shadow-lg">
                    Novo
                  </Badge>
                )}
                {/* Verifica se 'discount' existe e é maior que 0 */}
                {product.discount && product.discount > 0 && (
                  <Badge className="bg-red-500 text-white text-xs font-medium px-2 py-1 shadow-lg">
                    -{product.discount}%
                  </Badge>
                )}
              </div>

              {/* Botões de Ação (Coração e Olho) - Visíveis ao passar o mouse */}
              <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0 z-10">
                <Button
                  size="sm"
                  variant="secondary"
                  className="h-10 w-10 rounded-full shadow-lg bg-white/90 backdrop-blur-sm hover:bg-white border-0"
                  onClick={handleWishlistToggle} // Lida com a lista de desejos.
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
                  // Este botão pode ser usado para uma visualização rápida do produto (quick view).
                >
                  <Eye className="h-4 w-4 text-gray-600" />
                </Button>
              </div>

              {/* Botão de Adicionar Rápido ao Carrinho - Visível ao passar o mouse */}
              <div className="absolute bottom-4 left-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0 z-10">
                <Button
                  onClick={handleAddToCart} // Lida com a adição ao carrinho.
                  disabled={isAddingToCart || justAdded} // Desabilita se estiver adicionando ou já adicionado.
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

          {/* Informações do Produto (Nome, Preço, Descrição) - Clicável para navegar */}
          <Link href={`/product/${product.id}`} className="block">
            <div className="p-5 space-y-3 cursor-pointer">
              <div className="space-y-1">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {product.category?.name} {/* Exibe o nome da categoria */}
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
                  {/* Exibe o preço original riscado se houver promoção */}
                  {product.originalPrice && product.originalPrice > product.price && (
                    <span className="text-sm text-gray-500 line-through">
                      R$ {product.originalPrice.toFixed(2)}
                    </span>
                  )}
                </div>
                
                {/* Avaliação (mockada) */}
                <div className="flex items-center space-x-1">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span className="text-sm text-gray-600">4.5</span>
                </div>
              </div>

              {/* Indicadores de Tamanho Disponíveis */}
              {product.sizes && product.sizes.length > 0 && (
                <div className="flex items-center space-x-1">
                  <span className="text-xs text-gray-500">Tamanhos:</span>
                  <div className="flex space-x-1">
                    {/* Exibe até 4 tamanhos e um indicador "+X" se houver mais */}
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