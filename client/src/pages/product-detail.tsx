// pages/product-detail.tsx

import { useState, useEffect } from 'react';
import { useRoute, useLocation } from 'wouter';
import { Heart, ShoppingBag, Star, Truck, Shield, RotateCcw, ArrowLeft, Plus, Minus, Check, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';
import ProductCard from '@/components/product/product-card';
import WhatsAppButton from '@/components/ui/whatsapp-button';
import ShoppingCart from '@/components/cart/shopping-cart';
import CartNotification from '@/components/ui/cart-notification';
import { useCart } from '@/hooks/use-cart';
import { useWishlist } from '@/hooks/use-wishlist';
import { useToast } from '@/hooks/use-toast';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Product } from '@/types/backend'; // Importa a interface Product do backend
import { cn } from '@/lib/utils';

export default function ProductDetail() {
  const [, params] = useRoute('/product/:id');
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const productId = params?.id;

  const [selectedSize, setSelectedSize] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [quantity, setQuantity] = useState(1);
  const [justAdded, setJustAdded] = useState(false);
  const [showNotification, setShowNotification] = useState(false);

  const { addToCart, items } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();

  // Query para buscar os detalhes do produto principal usando react-query.
  const { data: product, isLoading: isLoadingProduct, isError: isErrorProduct } = useQuery<Product>({
    queryKey: ['product', productId],
    queryFn: async () => {
      if (!productId) {
        console.error('[product-detail] Erro: ID do produto não fornecido na URL.');
        throw new Error("ID do produto não fornecido.");
      }
      
      try {
        console.log(`[product-detail] Tentando buscar produto com ID: ${productId}`);
        const res = await apiRequest('GET', `/products/${productId}`);
        
        if (!res.ok) {
            const errorData = await res.json();
            console.error('[product-detail] Erro na resposta da API:', res.status, errorData);
            throw new Error(errorData.message || `Erro ao buscar produto: ${res.statusText}`);
        }

        const json = await res.json();
        console.log('[product-detail] Resposta da API para o produto:', json);

        // --- ALTERAÇÃO CRÍTICA AQUI ---
        // Verifica se 'json.data' existe e se 'json.data.id' existe.
        // Isso é necessário porque sua API está retornando os dados aninhados em uma propriedade 'data'.
        let productData: Product;
        if (json && typeof json === 'object' && 'data' in json && json.data && typeof json.data === 'object' && 'id' in json.data) {
          productData = json.data; // Retorna json.data, que é o objeto do produto real.
        } else if (json && typeof json === 'object' && 'id' in json) {
          // Fallback caso a API retorne o objeto do produto diretamente (sem 'data' aninhado)
          productData = json;
        } else {
          throw new Error("Formato de resposta da API inesperado ou produto não encontrado.");
        }
        
        // Add console log here to check images array
        console.log('[product-detail] Product images array:', productData.images); // <--- Adicionado este console.log
        
        return productData;
        // --- FIM DA ALTERAÇÃO CRÍTICA ---
      } catch (error) {
        console.error('[product-detail] Erro ao buscar dados do produto:', error);
        throw error;
      }
    },
    enabled: !!productId,
    staleTime: 1000 * 60 * 5,
  });

  // Query para buscar produtos relacionados (da mesma categoria) usando react-query.
  const { data: relatedProducts, isLoading: isLoadingRelatedProducts } = useQuery<Product[]>({
    queryKey: ['relatedProducts', product?.categoryId, product?.id],
    queryFn: async () => {
      if (!product?.categoryId) return [];
      const res = await apiRequest('GET', `/products?categoryId=${product.categoryId}`);
      // Filtra o próprio produto da lista de relacionados e limita a 4 resultados.
      const jsonResponse = await res.json();
      // Assume que a resposta para produtos relacionados também pode ter a estrutura { data: [...] }
      const prods = Array.isArray(jsonResponse.data) ? jsonResponse.data : jsonResponse;
      return prods.filter((p: Product) => p.id !== product.id).slice(0, 4);
    },
    enabled: !!product?.categoryId,
    staleTime: 1000 * 60 * 5,
  });

  // Efeito para definir tamanho e cor padrão quando o produto é carregado.
  useEffect(() => {
    if (product) {
      if (product.sizes && product.sizes.length > 0 && !selectedSize) setSelectedSize(product.sizes[0]);
      if (product.colors && product.colors.length > 0 && !selectedColor) setSelectedColor(product.colors[0]);
    }
  }, [product, selectedSize, selectedColor]);

  const isInCart = items.some(item => item.productId === productId);
  const isInWish = product ? isInWishlist(product.id) : false;

  const handleAddToCart = async () => {
    if (!product) return;

    if (product.sizes && product.sizes.length > 0 && !selectedSize) {
      toast({ title: "Erro", description: "Por favor, selecione um tamanho.", variant: "destructive" });
      return;
    }
    if (product.colors && product.colors.length > 0 && !selectedColor) {
      toast({ title: "Erro", description: "Por favor, selecione uma cor.", variant: "destructive" });
      return;
    }

    try {
      await addToCart(product.id, selectedSize, selectedColor, quantity);
      setJustAdded(true);
      setShowNotification(true);
      
      toast({
        title: "✅ Produto adicionado",
        description: `${product.name} foi adicionado ao carrinho com sucesso`,
        duration: 3000,
      });

      setTimeout(() => {
        setJustAdded(false);
      }, 3000);
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Falha ao adicionar produto ao carrinho",
        variant: "destructive",
      });
    }
  };

  const handleWishlistToggle = () => {
    if (!product) return;
    toggleWishlist(product.id);
  };

  if (isLoadingProduct) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div className="space-y-4">
              <Skeleton className="w-full aspect-square rounded-2xl" />
              <div className="grid grid-cols-4 gap-2">
                {[...Array(4)].map((_, i) => (
                  <Skeleton key={i} className="aspect-square rounded-lg" />
                ))}
              </div>
            </div>
            <div className="space-y-6">
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-12 w-1/3" />
              <Skeleton className="h-32 w-full" />
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (isErrorProduct || !product) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Produto não encontrado</h1>
          <Button 
            onClick={() => setLocation('/products')}
            className="bg-gray-900 hover:bg-black text-white rounded-xl"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar à loja
          </Button>
        </div>
        <Footer />
      </div>
    );
  }

  const isOnSale = product.originalPrice && product.originalPrice > product.price;
  const discount = isOnSale ? Math.round(((product.originalPrice! - product.price) / product.originalPrice!) * 100) : 0;

  return (
    <>
      <CartNotification 
        isVisible={showNotification}
        product={product}
        onClose={() => setShowNotification(false)}
      />
      
      <div className="min-h-screen bg-white">
        <Header />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <button onClick={() => setLocation('/')} className="hover:text-gray-900">
              Início
            </button>
            <span>/</span>
            <button onClick={() => setLocation('/products')} className="hover:text-gray-900">
              Produtos
            </button>
            <span>/</span>
            <span className="text-gray-900">{product.name}</span>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div className="space-y-4">
              <div className="relative aspect-square bg-gray-100 rounded-2xl overflow-hidden">
                <img
                  src={product.images?.[0] || 'https://placehold.co/600x800/e2e8f0/ffffff?text=Sem+Imagem'}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
                {isOnSale && (
                  <Badge className="absolute top-4 left-4 bg-red-500 text-white">
                    -{discount}%
                  </Badge>
                )}
                {product.isNew && (
                  <Badge className="absolute top-4 right-4 bg-green-500 text-white">
                    Novo
                  </Badge>
                )}
              </div>
              {product.images && product.images.length > 0 && (
                <div className="grid grid-cols-4 gap-2">
                  {product.images.map((img, index) => (
                    <div key={index} className="aspect-square bg-gray-100 rounded-lg overflow-hidden cursor-pointer">
                      <img src={img} alt={`${product.name} - ${index + 1}`} className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>
                <p className="text-gray-600 mb-4">{product.description}</p>
                
                <div className="flex items-center space-x-3 mb-4">
                  <span className="text-3xl font-bold text-gray-900">
                    R$ {product.price.toFixed(2)}
                  </span>
                  {isOnSale && (
                    <span className="text-xl text-gray-500 line-through">
                      R$ {product.originalPrice!.toFixed(2)}
                    </span>
                  )}
                </div>

                <div className="flex items-center space-x-1 mb-6">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-5 h-5 ${i < 4 ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                    />
                  ))}
                  <span className="text-sm text-gray-500 ml-2">(4.0) • 156 avaliações</span>
                </div>
              </div>

              {product.sizes && product.sizes.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-3">Tamanho</h3>
                  <div className="flex space-x-2">
                    {product.sizes.map((size) => (
                      <Button
                        key={size}
                        variant={selectedSize === size ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setSelectedSize(size)}
                        className={cn(
                          "rounded-lg",
                          selectedSize === size 
                            ? "bg-gray-900 hover:bg-black text-white" 
                            : "border-gray-300 hover:border-gray-400"
                        )}
                      >
                        {size}
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              {product.colors && product.colors.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-3">Cor: {selectedColor}</h3>
                  <div className="flex space-x-3">
                    {product.colors.map((color) => (
                      <button
                        key={color}
                        onClick={() => setSelectedColor(color)}
                        className={cn(
                          "w-8 h-8 rounded-full border-2 transition-all",
                          selectedColor === color 
                            ? "border-gray-900 scale-110" 
                            : "border-gray-300 hover:border-gray-400"
                        )}
                        style={{
                          backgroundColor: 
                            color.toLowerCase() === 'preto' ? '#000000' :
                            color.toLowerCase() === 'branco' ? '#ffffff' :
                            color.toLowerCase() === 'cinza' ? '#6b7280' :
                            color.toLowerCase() === 'azul' ? '#3b82f6' :
                            color.toLowerCase() === 'rosa' ? '#ec4899' :
                            color.toLowerCase() === 'verde' ? '#10b981' :
                            color.toLowerCase() === 'bordo' ? '#800020' :
                            color.toLowerCase() === 'off white' ? '#f5f5dc' :
                            color.toLowerCase() === 'vinho' ? '#7c2d12' :
                            color.toLowerCase() === 'camel' ? '#d2691e' :
                            color.toLowerCase() === 'bege' ? '#f5f5dc' :
                            '#6b7280'
                        }}
                        title={color}
                      />
                    ))}
                  </div>
                </div>
              )}

              <div>
                <h3 className="font-semibold mb-3">Quantidade</h3>
                <div className="flex items-center space-x-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                  >
                    <Minus className="w-4 h-4" />
                  </Button>
                  <span className="w-12 text-center font-semibold">{quantity}</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setQuantity(quantity + 1)}
                    disabled={quantity >= product.stock}
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  {product.stock} unidades disponíveis
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex space-x-4">
                  <Button
                    onClick={handleAddToCart}
                    disabled={justAdded || quantity > product.stock || quantity <= 0}
                    className={cn(
                      "flex-1 py-4 text-lg font-semibold rounded-xl transition-all duration-500",
                      justAdded 
                        ? 'bg-green-600 hover:bg-green-600 text-white scale-105' 
                        : isInCart
                        ? 'bg-gray-600 hover:bg-gray-700 text-white'
                        : 'bg-gray-900 hover:bg-black text-white hover:scale-105'
                    )}
                  >
                    {justAdded ? (
                      <Check className="w-5 h-5 mr-2 animate-bounce" />
                    ) : isInCart ? (
                      <Check className="w-5 h-5 mr-2" />
                    ) : (
                      <ShoppingBag className="w-5 h-5 mr-2" />
                    )}
                    {justAdded ? 'Adicionado!' : isInCart ? 'No Carrinho' : 'Adicionar ao Carrinho'}
                  </Button>

                  <Button
                    variant="outline"
                    onClick={handleWishlistToggle}
                    className="px-4 py-4 rounded-xl border-gray-300 hover:border-gray-400"
                  >
                    <Heart className={cn(
                      "w-5 h-5",
                      isInWish ? "fill-red-500 text-red-500" : "text-gray-600"
                    )} />
                  </Button>
                </div>
              </div>

              <div className="border-t pt-6">
                <div className="grid grid-cols-1 gap-4">
                  <div className="flex items-center space-x-3">
                    <Truck className="w-5 h-5 text-gray-400" />
                    <span className="text-sm text-gray-600">
                      Frete grátis para compras acima de R$ 199
                    </span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <RotateCcw className="w-5 h-5 text-gray-400" />
                    <span className="text-sm text-gray-600">
                      30 dias para trocas e devoluções
                    </span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Shield className="w-5 h-5 text-gray-400" />
                    <span className="text-sm text-gray-600">
                      Compra 100% segura e protegida
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {relatedProducts && relatedProducts.length > 0 && (
            <div className="mt-16">
              <h2 className="text-2xl font-bold text-gray-900 mb-8">Produtos Relacionados</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {relatedProducts.map((relatedProduct) => (
                  <ProductCard 
                    key={relatedProduct.id} 
                    product={relatedProduct}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        <ShoppingCart />
        <WhatsAppButton />
        <Footer />
      </div>
    </>
  );
}