// src/pages/products.tsx

import { useState, useEffect } from 'react';
import { useLocation, useRoute } from 'wouter';
import { Filter, Grid, List } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';
import ProductCard from '@/components/product/product-card';
import ShoppingCart from '@/components/cart/shopping-cart';
import WhatsAppButton from '@/components/ui/whatsapp-button';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Product, Category } from '@/types/backend'; // Importa as interfaces do backend

export default function Products() {
  const [location] = useLocation();
  const [sortBy, setSortBy] = useState('default');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Parse URL parameters
  const [, params] = useRoute('/products/:category');
  const categorySlug = params?.category;
  const urlParams = new URLSearchParams(location.split('?')[1] || '');
  const searchQuery = urlParams.get('search');
  const featured = urlParams.get('featured');

  // Query para buscar categorias
  const { data: categories, isLoading: isLoadingCategories } = useQuery<Category[]>({
    queryKey: ['categories'],
    queryFn: async () => {
      const res = await apiRequest('GET', '/categories');
      return res.json();
    },
    staleTime: 1000 * 60 * 60, // 1 hora de cache
  });

  const selectedCategory = categories?.find(cat => cat.slug === categorySlug);

  // Query para buscar produtos
  const { data: products, isLoading: isLoadingProducts } = useQuery<Product[]>({
    queryKey: ['products', selectedCategory?.id, searchQuery, featured, sortBy], // Query key dinâmica para re-fetch
    queryFn: async () => {
      const params = new URLSearchParams();
      if (selectedCategory?.id) {
        params.append('categoryId', selectedCategory.id);
      }
      if (searchQuery) {
        params.append('search', searchQuery);
      }
      if (featured) {
        params.append('isFeatured', 'true'); // Backend espera boolean como string
      }
      if (sortBy && sortBy !== 'default') {
        params.append('sortBy', sortBy);
      }
      const res = await apiRequest('GET', `/products?${params.toString()}`);
      return res.json();
    },
    staleTime: 1000 * 60 * 2, // 2 minutos de cache para produtos
  });

  const getPageTitle = () => {
    if (searchQuery) return `Resultados para "${searchQuery}"`;
    if (featured) return 'Produtos em Destaque';
    if (selectedCategory) return selectedCategory.name;
    return 'Todos os Produtos';
  };

  const totalProducts = products?.length || 0;

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{getPageTitle()}</h1>
          <p className="text-gray-600">
            {isLoadingProducts ? 'Carregando...' : `${totalProducts} produto${totalProducts !== 1 ? 's' : ''} encontrado${totalProducts !== 1 ? 's' : ''}`}
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
                <SelectItem value="default">Ordem Padrão</SelectItem>
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
        {isLoadingProducts ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="space-y-4">
                <Skeleton className="w-full aspect-[3/4] rounded-lg" />
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-6 w-1/2" />
              </div>
            ))}
          </div>
        ) : totalProducts === 0 ? (
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
              ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 lg:gap-8"
              : "space-y-6"
          }>
            {products?.map((product) => (
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