// Mock data para produtos da MKcloset
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
  isFeatured: boolean;
  discount?: number;
  stock: number;
  images?: string[]; // <--- ADICIONADO AQUI
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
  {
    id: 1,
    name: "Vestidos",
    slug: "vestidos",
    description: "Vestidos elegantes para todas as ocasiões",
    imageUrl: "/images/frente.jpg",
    productCount: 15
  },
  {
    id: 2,
    name: "Top",
    slug: "Top",
    description: "Blusas femininas modernas e confortáveis",
    imageUrl: "/images/frente.jpg",
    productCount: 22
  },
  {
    id: 3,
    name: "Calças",
    slug: "calcas",
    description: "Calças femininas de alta qualidade",
    imageUrl: "/images/frente.jpg",
    productCount: 18
  },
  {
    id: 4,
    name: "Saias",
    slug: "saias",
    description: "Saias elegantes e versáteis",
    imageUrl: "/images/frente.jpg",
    productCount: 12
  },
  {
    id: 5,
    name: "Casacos",
    slug: "casacos",
    description: "Casacos e jaquetas para o inverno",
    imageUrl: "/images/frente.jpg",
    productCount: 8
  }
];

export const mockProducts: MockProduct[] = [
  {
    id: 1,
    name: "Conjunto Júlia",
    description: "top e saia com shorts no melhor estilo cargo! A cor bordo traz um toque de elegância, perfeita para qualquer ocasião!Com bolsos funcionais e um cintinho que valoriza a silhueta, esse look é ideal para quem busca praticidade sem abrir mão do estilo.",
    price: 405.59,
    originalPrice: 449.90,
    imageUrl: "/images/frente.jpg",  // Caminho local
    images: [
    "/images/frente.jpg", // Imagem frontal
    "/images/lado.jpg",   // Imagem lateral
    "/images/tras.jpg"    // Imagem traseira
  ],
    // imageUrl: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=400&h=600&fit=crop", //
    category: "Conjuntos",
    categoryId: 1,
    sizes: [ "M"],
    colors: ["Vinho"],
    isNew: true,
    isFeatured: true,
    discount: 24,
    stock: 15
  },
  {
    id: 2,
    name: "Blusa Básica Algodão",
    description: "Blusa básica em algodão 100%, confortável e versátil para o dia a dia.",
    price: 79.90,
    imageUrl: "/images/frente.jpg",
    category: "Blusas",
    categoryId: 2,
    sizes: ["PP", "P", "M", "G"],
    colors: ["Branco", "Preto", "Cinza"],
    isNew: false,
    isFeatured: true,
    stock: 25
  },
  {
    id: 3,
    name: "Calça Jeans Skinny Premium",
    description: "Calça jeans skinny de corte premium, modelagem que valoriza o corpo feminino.",
    price: 159.90,
    originalPrice: 199.90,
    imageUrl: "/images/frente.jpg",
    category: "Calças",
    categoryId: 3,
    sizes: ["36", "38", "40", "42", "44"],
    colors: ["Azul Escuro", "Azul Claro", "Preto"],
    isNew: false,
    isFeatured: true,
    discount: 20,
    stock: 12
  },
  {
    id: 4,
    name: "Saia Plissada Midi",
    description: "Saia plissada midi elegante, ideal para looks femininos e sofisticados.",
    price: 129.90,
    imageUrl: "/images/frente.jpg",
    category: "Saias",
    categoryId: 4,
    sizes: ["P", "M", "G"],
    colors: ["Preto", "Camel", "Vinho"],
    isNew: true,
    isFeatured: false,
    stock: 8
  },
  {
    id: 5,
    name: "Blazer Estruturado Feminino",
    description: "Blazer estruturado de alfaiataria, perfeito para looks profissionais e elegantes.",
    price: 299.90,
    imageUrl: "/images/frente.jpg",
    category: "Casacos",
    categoryId: 5,
    sizes: ["P", "M", "G", "GG"],
    colors: ["Preto", "Marinho", "Bege"],
    isNew: false,
    isFeatured: true,
    stock: 6
  },
  {
    id: 6,
    name: "Vestido Longo Festa",
    description: "Vestido longo para festas e eventos especiais, tecido fluido e modelagem elegante.",
    price: 349.90,
    originalPrice: 459.90,
    imageUrl: "/images/tras.jpg",
    category: "Vestidos",
    categoryId: 1,
    sizes: ["P", "M", "G"],
    colors: ["Preto", "Vinho", "Azul Marinho"],
    isNew: true,
    isFeatured: true,
    discount: 24,
    stock: 4
  },
  {
    id: 7,
    name: "Blusa Manga Longa Tricot",
    description: "Blusa de tricot manga longa, macia e quentinha para os dias mais frios.",
    price: 119.90,
    imageUrl: "/images/tras.jpg",
    category: "Blusas",
    categoryId: 2,
    sizes: ["P", "M", "G", "GG"],
    colors: ["Camel", "Off White", "Preto"],
    isNew: false,
    isFeatured: false,
    stock: 18
  },
  {
    id: 8,
    name: "Calça Wide Leg Linho",
    description: "Calça wide leg em linho, confortável e elegante para looks casuais.",
    price: 189.90,
    imageUrl: "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=400&h=600&fit=crop",
    category: "Calças",
    categoryId: 3,
    sizes: ["36", "38", "40", "42"],
    colors: ["Bege", "Branco", "Terracota"],
    isNew: true,
    isFeatured: false,
    stock: 10
  },
  {
    id: 9,
    name: "Top Julia",
    description: "Vestido curto casual para o dia a dia, tecido leve e estampa moderna.",
    price: 139.90,
    imageUrl: "/images/lado.jpg",
    category: "Vestidos",
    categoryId: 1,
    sizes: ["PP", "P", "M", "G"],
    colors: ["Estampado Floral", "Estampado Geométrico"],
    isNew: false,
    isFeatured: true,
    stock: 20
  },
  {
    id: 10,
    name: "Jaqueta Jeans Oversized",
    description: "Jaqueta jeans oversized, versátil e moderna para compor diversos looks.",
    price: 179.90,
    imageUrl: "/images/tras.jpg",
    category: "Casacos",
    categoryId: 5,
    sizes: ["P", "M", "G"],
    colors: ["Azul Médio", "Azul Escuro"],
    isNew: true,
    isFeatured: false,
    stock: 7
  },
  {
    id: 11,
    name: "Blusa Cetim Decote V",
    description: "Blusa em cetim com decote V, elegante e sofisticada para ocasiões especiais.",
    price: 149.90,
    imageUrl: "/images/tras.jpg",
    category: "Blusas",
    categoryId: 2,
    sizes: ["P", "M", "G"],
    colors: ["Dourado", "Prata", "Preto"],
    isNew: false,
    isFeatured: true,
    stock: 9
  },
  {
    id: 12,
    name: "Saia Lápis Cintura Alta",
    description: "Saia lápis de cintura alta, modelagem que valoriza a silhueta feminina.",
    price: 109.90,
    imageUrl: "/images/tras.jpg",
    category: "Saias",
    categoryId: 4,
    sizes: ["36", "38", "40", "42"],
    colors: ["Preto", "Marinho", "Cinza"],
    isNew: false,
    isFeatured: false,
    stock: 14
  },
  {
    id: 13,
    name: "Conjunto Glamour",
    description: "top e saia com shorts no melhor estilo cargo! A cor bordo traz um toque de elegância, perfeita para qualquer ocasião!Com bolsos funcionais e um cintinho que valoriza a silhueta, esse look é ideal para quem busca praticidade sem abrir mão do estilo.",
    price: 405.59,
    originalPrice: 449.90,
    imageUrl: "/images/glamour-lado.jpg",  // Caminho local
    images: [
    "/images/frente.jpg", // Imagem frontal
    "/images/lado.jpg",   // Imagem lateral
    "/images/tras.jpg"    // Imagem traseira
  ],
    // imageUrl: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=400&h=600&fit=crop", //
    category: "Conjuntos",
    categoryId: 1,
    sizes: [ "M"],
    colors: ["Vinho"],
    isNew: true,
    isFeatured: true,
    discount: 24,
    stock: 15
  },

];

// Função para filtrar produtos
export const getFilteredProducts = (filters: {
  category?: number;
  search?: string;
  featured?: boolean;
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

  if (filters.featured) {
    filtered = filtered.filter(product => product.isFeatured);
  }

  if (filters.isNew) {
    filtered = filtered.filter(product => product.isNew);
  }

  return filtered;
};

// Função para buscar produto por ID
export const getProductById = (id: number): MockProduct | undefined => {
  return mockProducts.find(product => product.id === id);
};

// Função para buscar categoria por slug
export const getCategoryBySlug = (slug: string): MockCategory | undefined => {
  return mockCategories.find(category => category.slug === slug);
};

// Função para buscar produtos relacionados
export const getRelatedProducts = (productId: number, limit: number = 4): MockProduct[] => {
  const product = getProductById(productId);
  if (!product) return [];

  return mockProducts
    .filter(p => p.id !== productId && p.categoryId === product.categoryId)
    .slice(0, limit);
};