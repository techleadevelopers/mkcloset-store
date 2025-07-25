// src/pages/products.tsx (ou o caminho exato do seu Products.tsx)

import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Filter, Grid, List } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';
import ProductCard from '@/components/product/product-card';
import ShoppingCart from '@/components/cart/shopping-cart';
import WhatsAppButton from '@/components/ui/whatsapp-button';
import { mockProducts, mockCategories, getFilteredProducts, getCategoryBySlug, type MockProduct, type MockCategory } from '@/lib/mock-data'; // Usando '@/lib/mock-data' conforme seu import

export default function Products() {
  const [location] = useLocation();
  const [sortBy, setSortBy] = useState('default'); // <--- MUDANÇA AQUI: Mudei o valor inicial para 'default'
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [products, setProducts] = useState<MockProduct[]>([]);
  const [categories, setCategories] = useState<MockCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Parse URL parameters
  const urlParams = new URLSearchParams(location.split('?')[1] || '');
  const categorySlug = location.split('/products/')[1]?.split('?')[0];
  const searchQuery = urlParams.get('search');
  const featured = urlParams.get('featured');

  const category = getCategoryBySlug(categorySlug || '');

  useEffect(() => {
    const loadProducts = async () => {
      setIsLoading(true);
      await new Promise(resolve => setTimeout(resolve, 300)); // Simular delay
      
      const filters: any = {};
      if (category?.id) filters.category = category.id;
      if (searchQuery) filters.search = searchQuery;
      if (featured) filters.featured = true;
      
      const filteredProducts = getFilteredProducts(filters);
      setProducts(filteredProducts); // <-- Esta lista vem na ordem do mockProducts.ts
      setCategories(mockCategories);
      setIsLoading(false);
    };

    loadProducts();
  }, [category, searchQuery, featured]);

  // Lógica de ordenação: Adicionamos um caso para 'default'
  const sortedProducts = [...products].sort((a, b) => {
    switch (sortBy) {
      case 'default': // <--- MUDANÇA AQUI: Novo caso para ordem padrão
        return 0; // Retorna 0 para não alterar a ordem, mantendo a ordem original do array 'products'
      case 'price-low':
        return a.price - b.price;
      case 'price-high':
        return b.price - a.price;
      case 'name':
        return a.name.localeCompare(b.name);
      default:
        return 0; // Fallback para ordem padrão se sortBy for inválido
    }
  });

  const getPageTitle = () => {
    if (searchQuery) return `Resultados para "${searchQuery}"`;
    if (featured) return 'Produtos em Destaque';
    if (category) return category.name;
    return 'Todos os Produtos';
  };

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{getPageTitle()}</h1>
          <p className="text-gray-600">
            {isLoading ? 'Carregando...' : `${products.length} produto${products.length !== 1 ? 's' : ''} encontrado${products.length !== 1 ? 's' : ''}`}
          </p>
        </div>

        {/* Filters and Sort */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 space-y-4 sm:space-y-0">
          <div className="flex items-center space-x-4">
            <Button variant="outline" size="sm" className="border-gray-200 hover:bg-gray-50">
              <Filter className="h-4 w-4 mr-2" />
              Filtros
            </Button>
          </div>

          <div className="flex items-center space-x-4">
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-48 border-gray-200">
                <SelectValue placeholder="Ordenar por" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="default">Ordem Padrão</SelectItem> {/* <--- MUDANÇA AQUI: Nova opção */}
                <SelectItem value="name">Nome A-Z</SelectItem>
                <SelectItem value="price-low">Menor preço</SelectItem>
                <SelectItem value="price-high">Maior preço</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex border border-gray-200 rounded-lg">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('grid')}
                className={`rounded-r-none ${viewMode === 'grid' ? 'bg-gray-900 text-white' : 'hover:bg-gray-50'}`}
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
                className={`rounded-l-none ${viewMode === 'list' ? 'bg-gray-900 text-white' : 'hover:bg-gray-50'}`}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Products Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"> {/* APENAS AQUI: Mudado lg:grid-cols-4 para lg:grid-cols-3 */}
            {[...Array(8)].map((_, i) => (
              <div key={i} className="space-y-4">
                <Skeleton className="w-full aspect-[3/4] rounded-lg" />
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-6 w-1/2" />
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-gray-400 mb-4">
              <svg className="mx-auto h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.47-.881-6.08-2.33" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Nenhum produto encontrado</h3>
            <p className="text-gray-600 mb-6">
              {searchQuery 
                ? 'Tente ajustar sua busca ou navegar pelas categorias'
                : 'Esta categoria ainda não possui produtos disponíveis'
              }
            </p>
            <Button onClick={() => window.history.back()}>
              Voltar
            </Button>
          </div>
        ) : (
          <div className={
            viewMode === 'grid' 
              ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 lg:gap-8" // <<-- APENAS AQUI: Mudado lg:grid-cols-4 para lg:grid-cols-3
              : "space-y-6"
          }>
            {sortedProducts.map((product) => (
              <ProductCard 
                key={product.id} 
                product={product}
                className={viewMode === 'list' ? 'flex-row max-w-2xl' : ''}
              />
            ))}
          </div>
        )}
      </div>

      <Footer />
      <ShoppingCart />
      <WhatsAppButton />
    </div>
  );
}