import { useState, useEffect } from 'react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Truck, Shield, RotateCcw, ArrowRight } from 'lucide-react';
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

  const images = [
    "/images/tras.jpg",
    "/images/lado.jpg",
    "/images/frente.jpg", // Troque pelos caminhos corretos
    "/images/glamour-frente.jpg"
  ];

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      await new Promise(resolve => setTimeout(resolve, 500)); // Simular delay de rede

      const featured = getFilteredProducts({ featured: true });
      setFeaturedProducts(featured);
      setCategories(mockCategories);
      setIsLoading(false);
    };

    loadData();

    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-gray-50 to-gray-100 py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h2 className="text-3xl sm:text-4xl lg:text-6xl font-bold text-gray-900 mb-4">
                Nova Coleção
                <span className="block text-gradient-black">
                  Primavera/Verão
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
                  className="w-full h-[810px] object-cover rounded-2xl mb-0 transition-opacity duration-500" // Adicionado h-[500px]
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

      {/* Categories Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">Compre por Categoria</h3>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Encontre o que você procura em nossas categorias cuidadosamente organizadas
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {isLoading ? (
              [...Array(3)].map((_, i) => (
                <div key={i} className="bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300">
                  <div className="p-6">
                    <Skeleton className="w-full h-64 rounded-xl mb-4" />
                    <Skeleton className="h-6 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-full mb-4" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                </div>
              ))
            ) : (
              categories.slice(0, 3).map((category) => (
                <Link key={category.id} href={`/products/${category.slug}`}>
                  <div className="group cursor-pointer bg-white rounded-2xl shadow-sm hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border-0 overflow-hidden">
                    <div className="p-6">
                      <img
                        src={category.imageUrl || '/images/tras.jpg'}
                        alt={`Coleção ${category.name}`}
                        className="w-full h-64 object-cover rounded-xl mb-4 transition-transform duration-300 group-hover:scale-105"
                      />
                      <h4 className="text-xl font-semibold text-gray-900 mb-2">{category.name}</h4>
                      <p className="text-gray-600 mb-4">{category.description}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-700 font-semibold group-hover:text-gray-900 transition-colors">
                          Ver Coleção
                        </span>
                        <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-gray-700 transition-all group-hover:translate-x-1" />
                      </div>
                    </div>
                  </div>
                </Link>
              ))
            )}
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

      {/* Promo Banner */}
      <section className="py-16 bg-gradient-to-r from-gray-800 to-black text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h3 className="text-4xl font-bold mb-6">Frete Grátis em Compras Acima de R$ 199</h3>
              <p className="text-xl mb-8 opacity-90">
                Aproveite nossa promoção especial e receba seus produtos favoritos sem custo adicional de entrega.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/products">
                  <Button variant="secondary" className="bg-white text-gray-900 hover:bg-gray-100 px-8 py-3 rounded-xl">
                    Comprar Agora
                  </Button>
                </Link>
                <Button variant="outline" className="border-white text-white hover:bg-white hover:text-gray-900 px-8 py-3 rounded-xl">
                  Ver Condições
                </Button>
              </div>
            </div>
            <div className="text-center">
              <div className="bg-white bg-opacity-20 rounded-2xl p-8 backdrop-blur-sm">
                <Truck className="h-16 w-16 mx-auto mb-4" />
                <h4 className="text-2xl font-bold mb-2">Entrega Rápida</h4>
                <p className="opacity-90">Receba em até 2 dias úteis</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Badges */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-gray-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
                <Truck className="h-10 w-10 text-gray-600" />
              </div>
              <h4 className="text-xl font-semibold text-gray-900 mb-2">Frete Grátis</h4>
              <p className="text-gray-600">Acima de R$ 199 para todo o Brasil</p>
            </div>
            <div className="text-center">
              <div className="bg-gray-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
                <Shield className="h-10 w-10 text-gray-600" />
              </div>
              <h4 className="text-xl font-semibold text-gray-900 mb-2">Compra Segura</h4>
              <p className="text-gray-600">Seus dados protegidos com criptografia SSL</p>
            </div>
            <div className="text-center">
              <div className="bg-gray-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
                <RotateCcw className="h-10 w-10 text-gray-600" />
              </div>
              <h4 className="text-xl font-semibold text-gray-900 mb-2">Troca Fácil</h4>
              <p className="text-gray-600">30 dias para trocar ou devolver</p>
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