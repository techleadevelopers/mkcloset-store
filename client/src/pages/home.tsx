// src/pages/home.tsx (ou o caminho exato do seu Home.tsx)

import { useState, useEffect } from 'react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Truck, Shield, RotateCcw, ArrowRight, Plus } from 'lucide-react';
import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';
import ProductCard from '@/components/product/product-card';
import ShoppingCart from '@/components/cart/shopping-cart';
import WhatsAppButton from '@/components/ui/whatsapp-button';
import { mockProducts, mockCategories, getFilteredProducts, type MockProduct, type MockCategory } from '@/lib/mock-data';
import InstagramFeedSection from '@/components/InstagramFeedSection'; // Importa a nova seção do Instagram

export default function Home() {
  const [featuredProducts, setFeaturedProducts] = useState<MockProduct[]>([]);
  const [categories, setCategories] = useState<MockCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Array de imagens atualizado para o carrossel da Hero Section
  const images = [
    "/images/frente.jpg", // Conjunto Julia - frente
    "/images/tras.jpg",   // Conjunto Julia - trás (também para Vestidos)
    "/images/lado.jpg",   // Conjunto Julia - lado
    "/images/glamour.jpg", // Conjunto Glamour
    "/images/glamour-frente.jpg", // Conjunto Glamour - frente
    "/images/glamour-lado.jpg", // Conjunto Glamour - lado
    "/images/olivia-frente.jpg", // Conjunto Olivia - frente
    "/images/olivia-lado.jpg",    // Conjunto Olivia - lado
    "/images/olivia-tras.jpg",    // Conjunto Olivia - trás
    "/images/top-julia.jpg",      // Top Julia
    "/images/top-glamour.jpg",    // Top Glamour
    "/images/saia-julia.jpg",     // Saia Julia
    "/images/saia-glamour.jpg",   // Saia Glamour
  ];

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      await new Promise(resolve => setTimeout(resolve, 500)); // Simular delay de rede

      const featured = getFilteredProducts({ featured: true });
      setFeaturedProducts(featured);

      // Lógica para alinhar as imagens das categorias
      const updatedCategories = mockCategories.map(category => {
        let newImageUrl = category.imageUrl; // Mantém a imagem existente como padrão

        switch (category.name) {
          case 'Vestido': 
            newImageUrl = '/images/tras.jpg'; 
            break;
          case 'Blusas': 
            newImageUrl = '/images/top-julia.jpg'; 
            break;
          case 'Saia': 
            newImageUrl = '/images/saia-julia.jpg'; 
            break;
          case 'Calças':
            newImageUrl = '/images/olivia-frente.jpg'; 
            break;
          case 'Jaqueta': 
            newImageUrl = '/images/glamour-lado.jpg';
            break;
          default:
            break;
        }
        return { ...category, imageUrl: newImageUrl };
      });

      setCategories(updatedCategories); 
      setIsLoading(false);
    };

    loadData();

    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [images.length]);

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-gray-50 to-gray-100 py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
                <div className="text-3xl sm:text-4xl lg:text-8xl font-bold text-gray-900 mb-0 relative h-32 lg:h-48"> {/* Added relative and height to parent for absolute positioning */}
    <span className="luxurious-script-regular absolute left-0 top-1/2 transform -translate-y-1/2 rotate-[-deg] whitespace-nowrap origin-bottom-left" style={{ /* Optional: Add specific styles if needed */ }}>
        New Collections
    </span>
</div>
                <span className="block text-gradient-black font-chakra-petch">
    Outono/Inverno
</span>
              </h2>
              <p className="text-base sm:text-lg lg:text-xl text-gray-600 mb-6 leading-relaxed">
                Descubra as últimas tendências em moda feminina. Peças exclusivas com design contemporâneo e qualidade premium.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/products">
                  <Button className="bg-gradient-to-r from-gray-800 to-black hover:from-gray-900 hover:to-gray-800 text-white px-8 py-3 rounded-xl">
                    Explorar Coleção
                  </Button>
                </Link>
                <Link href="/products?featured=true">
                  <Button variant="outline" className="border-gray-300 text-gray-700 hover:bg-gray-50 px-8 py-3 rounded-xl">
                    Ver Promoções
                  </Button>
                </Link>
              </div>
            </div>
            <div className="relative">
              {/* Carrossel de Imagens */}
              <div className="overflow-hidden rounded-2xl shadow-2xl">
                <img
                  src={images[currentImageIndex]}
                  alt="Modelo usando vestido elegante da nova coleção"
                  className="w-full h-[810px] object-cover rounded-2xl mb-0 transition-opacity duration-500"
                />
              </div>
              <div className="absolute -bottom-6 -left-6 bg-white rounded-xl p-4 shadow-xl">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-sm font-semibold text-gray-700">Frete Grátis</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section - Clean & Simple */}
      <section className="py-12 sm:py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-12">
            <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3 sm:mb-4">Compre por Categoria</h3>
            <p className="text-gray-600 max-w-2xl mx-auto text-sm sm:text-base px-4 sm:px-0">
              Encontre exatamente o que você procura
            </p>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-6">
            {isLoading ? (
              [...Array(6)].map((_, i) => (
                <div key={i} className="text-center">
                  <div className="mb-3 sm:mb-4">
                    <Skeleton className="w-16 h-16 sm:w-20 sm:h-20 rounded-full mx-auto" />
                  </div>
                  <Skeleton className="h-3 sm:h-4 w-12 sm:w-16 mx-auto" />
                </div>
              ))
            ) : (
              categories.slice(0, 6).map((category) => (
                <Link key={category.id} href={`/products/${category.slug}`}>
                  <div className="group text-center cursor-pointer">
                    <div className="mb-3 sm:mb-4 relative">
                      <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto rounded-full overflow-hidden bg-gray-100 group-hover:shadow-lg transition-all duration-300">
                        <img
                          src={category.imageUrl}
                          alt={category.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                      </div>
                    </div>
                    <h4 className="text-xs sm:text-sm font-medium text-gray-900 group-hover:text-black transition-colors leading-tight px-1">
                      {category.name}
                    </h4>
                  </div>
                </Link>
              ))
            )}
          </div>

          <div className="text-center mt-6 sm:mt-8">
            <Link href="/products">
              <div className="inline-flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 bg-black hover:bg-gray-800 rounded-full cursor-pointer transition-all duration-300 hover:shadow-lg group">
                <Plus className="h-4 w-4 sm:h-5 sm:w-5 text-white group-hover:scale-110 transition-transform duration-200" />
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Restante do Home.tsx permanece o mesmo */}
      {/* Featured Products */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">Produtos em Destaque</h3>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Peças selecionadas especialmente para você
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            {isLoading ? (
              [...Array(4)].map((_, i) => (
                <div key={i} className="bg-white rounded-2xl shadow-sm overflow-hidden">
                  <Skeleton className="w-full aspect-[3/4]" />
                  <div className="p-6">
                    <Skeleton className="h-5 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-full mb-4" />
                    <div className="flex items-center justify-between">
                      <Skeleton className="h-6 w-1/3" />
                      <Skeleton className="h-10 w-20" />
                    </div>
                  </div>
                </div>
              ))
            ) : (
              featuredProducts.slice(0, 4).map((product) => (
                <ProductCard key={product.id} product={product} />
              ))
            )}
          </div>

          <div className="text-center mt-12">
            <Link href="/products">
              <Button variant="outline" className="border-gray-300 text-gray-700 hover:bg-gray-50 px-8 py-3 rounded-xl">
                Ver Todos os Produtos
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Promo Banner - SEÇÃO COMENTADA E REMOVIDA DA RENDERIZAÇÃO */}
      {/*
      <section className="py-12 sm:py-16 lg:py-20 bg-gradient-to-r from-gray-800 to-black text-white">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-12 items-center">
            <div className="text-center lg:text-left px-2 sm:px-0">
              <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-3 sm:mb-4 lg:mb-6 leading-tight">
                Frete Grátis em Compras Acima de R$ 199
              </h3>
              <p className="text-sm sm:text-lg lg:text-xl mb-6 sm:mb-8 opacity-90 leading-relaxed px-2 sm:px-0">
                Aproveite nossa promoção especial e receba seus produtos favoritos sem custo adicional de entrega.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center lg:justify-start">
                <Link href="/products">
                  <Button variant="secondary" className="bg-white text-gray-900 hover:bg-gray-100 px-6 py-2 sm:px-8 sm:py-3 rounded-lg sm:rounded-xl text-sm sm:text-base w-full sm:w-auto">
                    Comprar Agora
                  </Button>
                </Link>
                <Button variant="outline" className="border-white text-white hover:bg-white hover:text-gray-900 px-6 py-2 sm:px-8 sm:py-3 rounded-lg sm:rounded-xl text-sm sm:text-base w-full sm:w-auto">
                  Ver Condições
                </Button>
              </div>
            </div>
            <div className="text-center mt-8 lg:mt-0">
              <div className="bg-white bg-opacity-20 rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8 backdrop-blur-sm mx-4 sm:mx-0">
                <Truck className="h-12 w-12 sm:h-14 sm:w-14 lg:h-16 lg:w-16 mx-auto mb-2 sm:mb-3 lg:mb-4" />
                <h4 className="text-lg sm:text-xl lg:text-2xl font-bold mb-1 sm:mb-2 leading-tight">
                  Entrega Rápida
                </h4>
                <p className="opacity-90 text-sm sm:text-base">
                  Receba em até 2 dias úteis
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
      */}

      {/* Trust Badges - Enhanced */}
      <section className="py-12 sm:py-16 lg:py-20 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
          {/* Section Header */}
          <div className="text-center mb-8 sm:mb-12 lg:mb-16">
            <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-2 sm:mb-3 lg:mb-4 px-2">
              Por que escolher a MK Closet?
            </h3>
            <p className="text-gray-600 max-w-2xl mx-auto text-xs sm:text-sm lg:text-base px-4 sm:px-2 lg:px-0 leading-relaxed">
              Comprometidos em oferecer a melhor experiência de compra online
            </p>
          </div>

          {/* Benefits Grid */}
          <div className="grid grid-cols-3 gap-2 sm:gap-4 lg:gap-8 xl:gap-10">
            {/* Frete Grátis */}
            <div className="group">
              <div className="bg-white rounded-lg sm:rounded-xl lg:rounded-2xl p-2 sm:p-4 lg:p-8 shadow-sm hover:shadow-lg sm:hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-gray-200 text-center h-full">
                <div className="bg-gray-100 rounded-lg sm:rounded-xl lg:rounded-2xl w-10 h-10 sm:w-14 sm:h-14 lg:w-20 lg:h-20 flex items-center justify-center mx-auto mb-2 sm:mb-3 lg:mb-6 group-hover:scale-105 sm:group-hover:scale-110 transition-transform duration-300">
                  <Truck className="h-5 w-5 sm:h-7 sm:w-7 lg:h-10 lg:w-10 text-gray-600" />
                </div>
                <h4 className="text-xs sm:text-base lg:text-xl font-bold text-gray-900 mb-1 sm:mb-2 lg:mb-3 leading-tight">
                  Frete Grátis
                </h4>
                <p className="text-gray-600 text-xs sm:text-sm lg:text-base leading-tight sm:leading-relaxed mb-1 sm:mb-2 lg:mb-3 px-0.5 sm:px-1">
                  Acima de R$ 199 para todo o Brasil
                </p>
                <div className="text-xs text-gray-600 font-medium bg-gray-50 px-1.5 py-0.5 sm:px-2 sm:py-1 lg:px-3 rounded-full inline-block">
                  Economia garantida
                </div>
              </div>
            </div>

            {/* Compra Segura */}
            <div className="group">
              <div className="bg-white rounded-lg sm:rounded-xl lg:rounded-2xl p-2 sm:p-4 lg:p-8 shadow-sm hover:shadow-lg sm:hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-gray-200 text-center h-full">
                <div className="bg-gray-100 rounded-lg sm:rounded-xl lg:rounded-2xl w-10 h-10 sm:w-14 sm:h-14 lg:w-20 lg:h-20 flex items-center justify-center mx-auto mb-2 sm:mb-3 lg:mb-6 group-hover:scale-105 sm:group-hover:scale-110 transition-transform duration-300">
                  <Shield className="h-5 w-5 sm:h-7 sm:w-7 lg:h-10 lg:w-10 text-gray-600" />
                </div>
                <h4 className="text-xs sm:text-base lg:text-xl font-bold text-gray-900 mb-1 sm:mb-2 lg:mb-3 leading-tight">
                  Compra Segura
                </h4>
                <p className="text-gray-600 text-xs sm:text-sm lg:text-base leading-tight sm:leading-relaxed mb-1 sm:mb-2 lg:mb-3 px-0.5 sm:px-1">
                  Seus dados protegidos com criptografia SSL
                </p>
                <div className="text-xs text-gray-600 font-medium bg-gray-50 px-1.5 py-0.5 sm:px-2 sm:py-1 lg:px-3 rounded-full inline-block">
                  Certificado SSL
                </div>
              </div>
            </div>

            {/* Troca Fácil */}
            <div className="group">
              <div className="bg-white rounded-lg sm:rounded-xl lg:rounded-2xl p-2 sm:p-4 lg:p-8 shadow-sm hover:shadow-lg sm:hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-gray-200 text-center h-full">
                <div className="bg-gray-100 rounded-lg sm:rounded-xl lg:rounded-2xl w-10 h-10 sm:w-14 sm:h-14 lg:w-20 lg:h-20 flex items-center justify-center mx-auto mb-2 sm:mb-3 lg:mb-6 group-hover:scale-105 sm:group-hover:scale-110 transition-transform duration-300">
                  <RotateCcw className="h-5 w-5 sm:h-7 sm:w-7 lg:h-10 lg:w-10 text-gray-600" />
                </div>
                <h4 className="text-xs sm:text-base lg:text-xl font-bold text-gray-900 mb-1 sm:mb-2 lg:mb-3 leading-tight">
                  Troca Fácil
                </h4>
                <p className="text-gray-600 text-xs sm:text-sm lg:text-base leading-tight sm:leading-relaxed mb-1 sm:mb-2 lg:mb-3 px-0.5 sm:px-1">
                  30 dias para trocar ou devolver
                </p>
                <div className="text-xs text-gray-600 font-medium bg-gray-50 px-1.5 py-0.5 sm:px-2 sm:py-1 lg:px-3 rounded-full inline-block">
                  Sem complicação
                </div>
              </div>
            </div>
          </div>

          {/* Trust Indicators */}
          <div className="mt-8 sm:mt-12 lg:mt-16 text-center px-4">
            <div className="flex flex-col sm:flex-row flex-wrap justify-center items-center gap-3 sm:gap-6 lg:gap-8 opacity-60 max-w-4xl mx-auto">
              <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-500">
                <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-gray-400 rounded-full flex-shrink-0"></div>
                <span className="whitespace-nowrap">+1000 clientes satisfeitas</span>
              </div>
              <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-500">
                <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-gray-400 rounded-full flex-shrink-0"></div>
                <span className="whitespace-nowrap">Entrega em todo Brasil</span>
              </div>
              <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-500">
                <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-gray-400 rounded-full flex-shrink-0"></div>
                <span className="whitespace-nowrap">Suporte especializado</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <ShoppingCart />
      <WhatsAppButton />

      {/* A Nova Seção do Instagram integrada aqui */}
      <InstagramFeedSection /> 

      <Footer />
    </div>
  );
}