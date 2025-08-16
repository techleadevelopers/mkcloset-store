// src/pages/home.tsx

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
import InstagramFeedSection from '@/components/InstagramFeedSection';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Product, Category } from '@/types/backend'; // Importa as interfaces do backend

// URL base do seu backend para as imagens
const BACKEND_URL = 'https://mkcloset-backend-586033150214.southamerica-east1.run.app';

export default function Home() {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Array de imagens atualizado para o carrossel da Hero Section
  // Estes caminhos são relativos e precisam ser prefixados com a URL do backend
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

  // Query para buscar produtos em destaque
  const { data: featuredProducts, isLoading: isLoadingFeaturedProducts } = useQuery<Product[]>({
    queryKey: ['featuredProducts'],
    queryFn: async () => {
      const res = await apiRequest('GET', '/products/featured');
      const jsonResponse = await res.json(); // Pega a resposta JSON completa
      const productsData = jsonResponse.data; // Tenta pegar a propriedade 'data'

      // Verifica se 'productsData' é realmente um array
      if (!Array.isArray(productsData)) {
        console.error('A resposta da API para produtos em destaque não foi um array válido na propriedade "data":', jsonResponse);
        return []; // Retorna um array vazio para evitar erros de .slice
      }
      return productsData;
    },
    staleTime: 1000 * 60 * 5, // 5 minutos de cache
  });

  // Query para buscar categorias
  const { data: categories, isLoading: isLoadingCategories } = useQuery<Category[]>({
    queryKey: ['categories'],
    queryFn: async () => {
      const res = await apiRequest('GET', '/categories');
      const jsonResponse = await res.json(); // Pega a resposta JSON completa
      const categoriesData = jsonResponse.data; // Tenta pegar a propriedade 'data'

      // Verifica se 'categoriesData' é realmente um array
      if (!Array.isArray(categoriesData)) {
        console.error('A resposta da API para categorias não foi um array válido na propriedade "data":', jsonResponse);
        return []; // Retorna um array vazio para evitar erros de .slice
      }
      return categoriesData;
    },
    staleTime: 1000 * 60 * 60, // 1 hora de cache
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [images.length]);

  // Lógica para alinhar as imagens das categorias (mantida no frontend por enquanto)
  // Estes são fallbacks locais, mas devem ser tratados como caminhos do backend
  const getCategoryImageUrl = (categoryName: string) => {
    switch (categoryName) {
      case 'Vestido': return '/images/tras.jpg';
      case 'Blusas': return '/images/top-julia.jpg';
      case 'Saia': return '/images/saia-julia.jpg';
      case 'Calças': return '/images/olivia-frente.jpg';
      case 'Jaqueta': return '/images/glamour-lado.jpg';
      default: return '/images/default-category.jpg'; // Imagem padrão se não houver correspondência
    }
  };

  const isLoading = isLoadingFeaturedProducts || isLoadingCategories;

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-gray-50 to-gray-100 py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
                <span className="block text-4xl sm:text-5xl lg:text-6xl text-gray-900 mb-2 text-gradient-dona-carioca">
                  Novidades
                </span>
                <span className="block text-gradient-black text-2xl sm:text-3xl lg:text-4xl">
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
              <div className="overflow-hidden rounded-2xl shadow-2xl aspect-[3/4]">
                {/* APLICAÇÃO DO BACKEND_URL AQUI */}
                <img
                  src={`${BACKEND_URL}${images[currentImageIndex]}`}
                  alt="Modelo usando vestido elegante da nova coleção"
                  className="w-full h-full object-cover transition-opacity duration-500"
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
            {isLoadingCategories ? (
              [...Array(6)].map((_, i) => (
                <div key={i} className="text-center">
                  <div className="mb-3 sm:mb-4">
                    <Skeleton className="w-16 h-16 sm:w-20 sm:h-20 rounded-full mx-auto" />
                  </div>
                  <Skeleton className="h-3 sm:h-4 w-12 sm:w-16 mx-auto" />
                </div>
              ))
            ) : (
              // Garantir que categories é um array antes de usar slice
              categories?.slice(0, 6).map((category) => (
                <Link key={category.id} href={`/products/${category.slug}`}>
                  <div className="group text-center cursor-pointer">
                    <div className="mb-3 sm:mb-4 relative">
                      <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto rounded-full overflow-hidden bg-gray-100 group-hover:shadow-lg transition-all duration-300">
                        {/* APLICAÇÃO DO BACKEND_URL AQUI para category.imageUrl e fallback */}
                        <img
                          src={category.imageUrl ? `${BACKEND_URL}${category.imageUrl}` : `${BACKEND_URL}${getCategoryImageUrl(category.name)}`}
                          alt={category.name} // Adicionado alt text para acessibilidade
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
            {isLoadingFeaturedProducts ? (
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
              // Garantir que featuredProducts é um array antes de usar slice
              featuredProducts?.slice(0, 4).map((product) => (
                // ProductCard deve lidar com a URL base do backend internamente,
                // se ele renderiza imagens do produto.
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