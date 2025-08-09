// prisma/seed.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Iniciando o seed de dados...');

  // Limpar dados existentes para começar do zero
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  console.log('Dados antigos limpos.');

  // 1. Criação das Categorias
  const categoriasCriadas = await prisma.$transaction([
    prisma.category.create({
      data: { name: 'Vestido', slug: 'vestidos', imageUrl: '/images/tras.jpg' },
    }),
    prisma.category.create({
      data: { name: 'Blusas', slug: 'blusas', imageUrl: '/images/top-julia.jpg' },
    }),
    prisma.category.create({
      data: { name: 'Saia', slug: 'saias', imageUrl: '/images/saia-julia.jpg' },
    }),
    prisma.category.create({
      data: { name: 'Calças', slug: 'calcas', imageUrl: '/images/olivia-frente.jpg' },
    }),
    prisma.category.create({
      data: { name: 'Jaqueta', slug: 'jaquetas', imageUrl: '/images/glamour-lado.jpg' },
    }),
    prisma.category.create({
      data: { name: 'Conjuntos', slug: 'conjuntos', imageUrl: '/images/glamour.jpg' },
    }),
    prisma.category.create({
      data: { name: 'Regatas', slug: 'regatas', imageUrl: '/images/regata-courinho/frente.png' },
    }),
  ]);

  console.log('Categorias criadas.');

  // 2. Obtém os IDs das categorias
  const vestidos = categoriasCriadas.find(c => c.name === 'Vestido');
  const blusas = categoriasCriadas.find(c => c.name === 'Blusas');
  const saias = categoriasCriadas.find(c => c.name === 'Saia');
  const calcas = categoriasCriadas.find(c => c.name === 'Calças');
  const jaquetas = categoriasCriadas.find(c => c.name === 'Jaqueta');
  const conjuntos = categoriasCriadas.find(c => c.name === 'Conjuntos');
  const regatas = categoriasCriadas.find(c => c.name === 'Regatas');

  if (!vestidos || !blusas || !saias || !calcas || !jaquetas || !conjuntos || !regatas) {
    console.error('Erro: Não foi possível encontrar todas as categorias necessárias para o seed.');
    process.exit(1);
  }
  
  const vestidosId = vestidos.id;
  const blusasId = blusas.id;
  const saiasId = saias.id;
  const calcasId = calcas.id;
  const jaquetasId = jaquetas.id;
  const conjuntosId = conjuntos.id;
  const regatasId = regatas.id;

  // 3. Criação dos Produtos
  await prisma.product.createMany({
    data: [
      {
        name: 'Conjunto Julia',
        description: 'Conjunto elegante e moderno, com top e saia.',
        price: 189.90,
        images: ['/images/frente.jpg', '/images/tras.jpg'],
        stock: 10,
        categoryId: conjuntosId,
        isFeatured: true, // Adicionado como destaque
      },
      {
        name: 'Conjunto Glamour',
        description: 'Conjunto de alta costura, perfeito para eventos especiais.',
        price: 229.90,
        images: ['/images/glamour.jpg', '/images/glamour-lado.jpg'],
        stock: 10,
        categoryId: conjuntosId,
        isFeatured: true, // Adicionado como destaque
      },
      {
        name: 'Top Julia',
        description: 'Blusa top com detalhes modernos, ideal para compor looks casuais.',
        price: 89.90,
        images: ['/images/top-julia.jpg', '/images/frente.jpg'],
        stock: 10,
        categoryId: blusasId,
        isFeatured: false,
      },
      {
        name: 'Vestido Olivia',
        description: 'Vestido clássico e atemporal, com caimento perfeito.',
        price: 179.90,
        images: ['/images/olivia-frente.jpg', '/images/olivia-lado.jpg'],
        stock: 10,
        categoryId: vestidosId,
        isFeatured: false,
      },
      {
        name: 'Saia Julia',
        description: 'Saia elegante e versátil, perfeita para combinar com o Top Julia.',
        price: 99.90,
        images: ['/images/saia-julia.jpg'],
        stock: 10,
        categoryId: saiasId,
        isFeatured: false,
      },
      {
        name: 'Jaqueta Glamour',
        description: 'Jaqueta de couro sintético, perfeita para looks modernos.',
        price: 250.00,
        images: ['/images/glamour-lado.jpg'],
        stock: 10,
        categoryId: jaquetasId,
        isFeatured: false,
      },
      {
        name: 'Calça Olivia',
        description: 'Calça de alfaiataria com corte reto e caimento perfeito.',
        price: 169.90,
        images: ['/images/olivia-lado.jpg'],
        stock: 10,
        categoryId: calcasId,
        isFeatured: false,
      },
      {
        name: 'Vestido Básico',
        description: 'Vestido básico de algodão, ideal para o dia a dia.',
        price: 129.90,
        images: ['/images/tras.jpg'],
        stock: 10,
        categoryId: vestidosId,
        isFeatured: false,
      },
      {
        name: 'Saia Glamour',
        description: 'Saia de tecido nobre com acabamento impecável.',
        price: 149.90,
        images: ['/images/saia-glamour.jpg'],
        stock: 10,
        categoryId: saiasId,
        isFeatured: false,
      },

      // NOVOS PRODUTOS ADICIONADOS COM MÚLTIPLAS IMAGENS
      {
        name: 'Vestido Isabelle',
        description: 'Elegância, sensualidade e conforto em uma única peça. O vestido Isabella é confeccionado em poliamida com elastano de alta gramatura, garantindo sustentação, caimento impecável e um toque macio na pele. Seu design moderno conta com modelagem longa, fenda traseira e costas abertas, que destacam a silhueta com sofisticação.',
        price: 230.99,
        images: [
          '/images/vestido-isabele/isabele-frente.jpg',
          '/images/vestido-isabele/isabele-lado.jpg',
          '/images/vestido-isabele/isabele-tras.jpg'
        ],
        sizes: ['Único'],
        stock: 10,
        categoryId: vestidosId,
        isFeatured: true, // Adicionado como destaque
      },
      {
        name: 'Vestido Arabesco Bordado',
        description: 'Elegância, sensualidade e conforto em uma única peça. Vestido em tela todo bordado com estampas de Arabesco.',
        price: 259.99,
        images: [
          '/images/vestido-arabesco/ara-azul-sentada.png',
          '/images/vestido-arabesco/ara-azul-frente.png',
          '/images/vestido-arabesco/ara-azul-frente2.png',
          '/images/vestido-arabesco/ara-azul-lado.png'
        ],
        stock: 10,
        categoryId: vestidosId,
        isFeatured: false,
      },
      {
        name: 'Vestido Arabesco Bordado (outro)',
        description: 'Elegância, sensualidade e conforto em uma única peça. Vestido em tela todo bordado com estampas de Arabesco.',
        price: 259.99,
        images: [
          '/images/vestido-ara/ara-frente.png',
          '/images/vestido-ara/ara-tras.png',
          '/images/vestido-ara/ara-lado.png'
        ],
        stock: 10,
        categoryId: vestidosId,
        isFeatured: false,
      },
      {
        name: 'Regata Courinho',
        description: 'Elegância, sensualidade e conforto em uma única peça. Regata Courinho.',
        price: 159.99,
        images: [
          '/images/regata-courinho/frente.png',
          '/images/regata-courinho/tras.png',
          '/images/regata-courinho/ara-lado.png'
        ],
        stock: 10,
        categoryId: regatasId,
        isFeatured: false,
      },
      {
        name: 'Blusa Cropped Allure Gola Alta',
        description: 'Modelagem justa que realça o corpo, tecido canelado com alta elasticidade e gola alta para um toque elegante e moderno.',
        price: 130.00,
        images: [
          '/images/cropped-allure/frente.png',
          '/images/cropped-allure/tras.png'
        ],
        sizes: ['P'],
        stock: 10,
        categoryId: blusasId,
        isFeatured: true, // Adicionado como destaque
      },
      {
        name: 'Conjunto Pretinho',
        description: 'Modelagem justa que realça o corpo, tecido canelado com alta elasticidade e gola alta para um toque elegante e moderno.',
        price: 130.00,
        images: [
          '/images/conjunto-pretinho/frente.png',
          '/images/conjunto-pretinho/tras.png',
          '/images/conjunto-pretinho/lado.png'
        ],
        sizes: ['P'],
        stock: 10,
        categoryId: conjuntosId,
        isFeatured: false,
      },
    ],
  });

  console.log('Produtos criados e associados às categorias.');
  console.log('Seed de dados concluído com sucesso.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });