// src/data/products.ts (ou seu arquivo de dados)

export interface MockProduct {
  id: number;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  imageUrl: string;
  category: string;
  categoryId: number;
  sizes: string[];
  colors: string[];
  isNew: boolean;
  isFeatured: boolean; // Chave para a seção de destaque
  discount?: number;
  stock: number;
  images?: string[];
  weight?: number; // Peso em kg para cálculo de frete
  dimensions?: {
    length: number; // cm
    width: number; // cm  
    height: number; // cm
  };
}

export interface MockCategory {
  id: number;
  name: string;
  slug: string;
  description: string;
  imageUrl: string;
  productCount: number;
}

export const mockCategories: MockCategory[] = [
  // Mantenha suas categorias, pois seus produtos reais as utilizam.
  { id: 1, name: "Vestido", slug: "vestido", description: "Vestidos elegantes para todas as ocasiões", imageUrl: "/images/tras.jpg", productCount: 0 },
  { id: 2, name: "Blusas", slug: "blusas", description: "Blusas femininas modernas e confortáveis", imageUrl: "/images/top-julia.jpg", productCount: 0 },
  { id: 3, name: "Saia", slug: "saia", description: "Saias elegantes e versáteis", imageUrl: "/images/saia-julia.jpg", productCount: 0 },
  { id: 4, name: "Conjuntos", slug: "conjuntos", description: "Conjuntos completos para qualquer estilo", imageUrl: "/images/frente.jpg", productCount: 0 },
  { id: 5, name: "Jaqueta", slug: "jaqueta", description: "Jaquetas estilosas para complementar seu look", imageUrl: "/images/glamour-frente.jpg", productCount: 0 },
  { id: 6, name: "Shorts saia", slug: "shorts-saia", description: "Shorts saia confortáveis e na moda", imageUrl: "/images/lado.jpg", productCount: 0 },
  { id: 7, name: "Shorts", slug: "shorts", description: "Shorts versáteis para o dia a dia", imageUrl: "/images/olivia-lado.jpg", productCount: 0 },
  { id: 8, name: "Camisetas", slug: "camisetas", description: "Camisetas básicas e estampadas", imageUrl: "/images/top-glamour.jpg", productCount: 0 },
  { id: 9, name: "Body", slug: "body", description: "Bodies elegantes e sensuais", imageUrl: "/images/glamour.jpg", productCount: 0 },
  { id: 10, name: "Calças", slug: "calcas", description: "Calças femininas de alta qualidade e estilo", imageUrl: "/images/olivia-frente.jpg", productCount: 0 }
];

// mockProducts: AGORA CONTÉM APENAS OS SEUS 8 PRODUTOS REAIS, REORDENADOS.
export const mockProducts: MockProduct[] = [
  // --- Conjunto Júlia e Peças ---
  {
    id: 1,
    name: "Conjunto Júlia",
    description: "top e saia com shorts no melhor estilo cargo! Feito em malha de alta qualidade, ele é super confortável e estiloso. A cor bordo traz um toque de elegância, perfeita para qualquer ocasião! Com bolsos funcionais e um cintinho que valoriza a silhueta, esse look é ideal para quem busca praticidade sem abrir mão do estilo.",
    price: 505.00,
    imageUrl: "/images/frente.jpg", // AJUSTE ESTE E OS PRÓXIMOS CAMINHOS DE IMAGEM PARA OS SEUS CAMINHOS REAIS!
    images: ["/images/frente.jpg", "/images/lado.jpg", "/images/tras.jpg"],
    category: "Conjuntos",
    categoryId: 4,
    sizes: ["M"],
    colors: ["Bordo"],
    isNew: true,
    isFeatured: true, // DEFINIDO COMO DESTAQUE
    stock: 15,
    weight: 0.4,
    dimensions: { length: 25, width: 18, height: 3 }
  },
  {
    id: 2,
    name: "Top Julia",
    description: "Top do Conjunto Julia, vendido separadamente.",
    price: 145.00,
    imageUrl: "/images/top-julia.jpg",
    category: "Blusas",
    categoryId: 2,
    sizes: ["M"],
    colors: ["Bordo"],
    isNew: false,
    isFeatured: false, // Não é destaque
    stock: 10,
    weight: 0.2,
    dimensions: { length: 20, width: 15, height: 2 }
  },
  {
    id: 3,
    name: "Saia com shorts Julia",
    description: "Saia com shorts no melhor estilo cargo, vendida separadamente do Conjunto Julia.",
    price: 360.00,
    imageUrl: "/images/saia-julia.jpg",
    category: "Saia",
    categoryId: 3,
    sizes: ["M"],
    colors: ["Bordo"],
    isNew: false,
    isFeatured: false, // Não é destaque
    stock: 10,
    weight: 0.25,
    dimensions: { length: 22, width: 16, height: 2 }
  },
  // --- Conjunto Glamour e Peças ---
  {
    id: 4,
    name: "Conjunto glamour Aplicações premium",
    description: "Brilhe intensamente com esse cropped e shorts com toque de glamour! Qualidade premium. Perfeito para quem ama um estilo moderno e autêntico.",
    price: 525.00,
    imageUrl: "/images/glamour-lado.jpg",
    images: ["/images/glamour.jpg", "/images/glamour-frente.jpg", "/images/glamour-lado.jpg"],
    category: "Conjuntos",
    categoryId: 4,
    sizes: ["M"],
    colors: ["Preto"],
    isNew: true,
    isFeatured: true, // DEFINIDO COMO DESTAQUE
    stock: 15,
    weight: 0.45,
    dimensions: { length: 26, width: 19, height: 4 }
  },
  {
    id: 5,
    name: "Top Glamour",
    description: "Cropped com aplicações premium, vendido separadamente do Conjunto Glamour.",
    price: 250.00,
    imageUrl: "/images/top-glamour.jpg",
    category: "Blusas",
    categoryId: 2,
    sizes: ["M"],
    colors: ["Preto"],
    isNew: false,
    isFeatured: false, // Não é destaque
    stock: 10,
    weight: 0.25,
    dimensions: { length: 21, width: 16, height: 2 }
  },
  {
    id: 6,
    name: "Shorts Glamour",
    description: "Shorts com toque de glamour, vendido separadamente do Conjunto Glamour.",
    price: 275.00,
    imageUrl: "/images/shorts-glamour.jpg",
    category: "Shorts",
    categoryId: 7,
    sizes: ["M"],
    colors: ["Preto"],
    isNew: false,
    isFeatured: false, // Não é destaque
    stock: 10,
    weight: 0.2,
    dimensions: { length: 18, width: 14, height: 2 }
  },
  // --- Outros Produtos ---
  {
    id: 7,
    name: "Conjunto colete e shorts saia Olivia",
    description: "tencel 92% viscose 8% poliester colete com fechamento botões",
    price: 270.00,
    imageUrl: "/images/olivia-frente.jpg",
    images: ["/images/olivia-frente.jpg", "/images/olivia-lado.jpg", "/images/olivia-tras.jpg"],
    category: "Conjuntos",
    categoryId: 4,
    sizes: ["P"],
    colors: ["Off White"],
    isNew: true,
    isFeatured: true, // DEFINIDO COMO DESTAQUE
    stock: 10,
    weight: 0.35,
    dimensions: { length: 24, width: 17, height: 3 }
  },
  {
    id: 8,
    name: "Vestido",
    description: "Vestido elegante para diversas ocasiões.",
    price: 200.00,
    imageUrl: "/images/tras.jpg",
    category: "Vestido",
    categoryId: 1,
    sizes: ["P", "M", "G"],
    colors: ["Preto"],
    isNew: false,
    isFeatured: true, // DEFINIDO COMO DESTAQUE (para ter 4 produtos nos destaques)
    stock: 5,
    weight: 0.3,
    dimensions: { length: 30, width: 20, height: 2 }
  },
];

// As funções de filtro e busca permanecem as mesmas
export const getFilteredProducts = (filters: {
  category?: number;
  search?: string;
  featured?: boolean; // Usado para a seção de destaque
  isNew?: boolean;
}) => {
  let filtered = [...mockProducts];

  if (filters.category) {
    filtered = filtered.filter(product => product.categoryId === filters.category);
  }

  if (filters.search) {
    const searchLower = filters.search.toLowerCase();
    filtered = filtered.filter(product =>
      product.name.toLowerCase().includes(searchLower) ||
      product.description.toLowerCase().includes(searchLower) ||
      product.category.toLowerCase().includes(searchLower)
    );
  }

  // Se 'featured' for true, filtra apenas os produtos marcados como destaque
  if (filters.featured) {
    filtered = filtered.filter(product => product.isFeatured);
  }

  if (filters.isNew) {
    filtered = filtered.filter(product => product.isNew);
  }

  return filtered;
};

export const getProductById = (id: number): MockProduct | undefined => {
  return mockProducts.find(product => product.id === id);
};

export const getCategoryBySlug = (slug: string): MockCategory | undefined => {
  return mockCategories.find(category => category.slug === slug);
};

export const getRelatedProducts = (productId: number, limit: number = 4): MockProduct[] => {
  const product = getProductById(productId);
  if (!product) return [];

  // Filtra produtos relacionados pela mesma categoria, excluindo o produto atual
  return mockProducts
    .filter(p => p.id !== productId && p.categoryId === product.categoryId)
    .slice(0, limit);
};