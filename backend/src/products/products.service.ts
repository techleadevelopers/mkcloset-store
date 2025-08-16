import { Injectable, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { ProductEntity } from './entities/product.entity';
import { ProductQueryDto } from './dto/product-query.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createProductDto: any): Promise<ProductEntity> {
    // Implemente a lógica de criação do produto aqui
    throw new Error('Método create ainda não implementado.');
  }

  async findAll(query: ProductQueryDto): Promise<ProductEntity[]> {
    const { search, sortBy, sortOrder, categoryId, colors, sizes, page, limit } = query;

    const where: Prisma.ProductWhereInput = {};

    // Filtro por busca em nome e descrição
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Filtro por categoria
    if (categoryId) {
      where.categoryId = categoryId;
    }

    // Filtro por cores e tamanhos usando 'hasSome'
    if (colors) {
      const colorArray = colors.split(',');
      where.colors = { hasSome: colorArray };
    }

    if (sizes) {
      const sizeArray = sizes.split(',');
      where.sizes = { hasSome: sizeArray };
    }

    // Paginação
    const take = limit || 10;
    const skip = ((page || 1) - 1) * take;

    // Adicionado tratamento de erro para ordenação
    const validSortFields = ['name', 'price', 'createdAt', 'updatedAt'];
    const orderBy: Prisma.ProductOrderByWithRelationInput = sortBy && validSortFields.includes(sortBy)
      ? { [sortBy]: sortOrder || 'asc' }
      : { createdAt: 'desc' };

    try {
      const products = await this.prisma.product.findMany({
        where,
        orderBy,
        take,
        skip,
      });

      // Lógica para construir o caminho completo da imagem
      const productsWithCorrectPath = products.map(product => {
        let folderName = '';
        const productName = product.name.toLowerCase();

        // Mapeia o nome do produto para a subpasta correspondente
        if (productName.includes('julia')) {
          folderName = 'conjunto-julia';
        } else if (productName.includes('glamour')) {
          folderName = 'conjunto-glamour';
        } else if (productName.includes('elegância')) {
          folderName = 'vestido-elegancia';
        } else if (productName.includes('sensual')) {
          folderName = 'conjunto-sensual';
        } else if (productName.includes('olivia')) {
          folderName = 'conjunto-olivia';
        } else if (productName.includes('ara-preto')) {
          folderName = 'ara-preto';
        } else if (productName.includes('pretinho')) {
          folderName = 'conjunto-pretinho';
        } else if (productName.includes('allure')) {
          folderName = 'cropped-allure';
        } else if (productName.includes('regata-courinho')) {
          folderName = 'regata-courinho';
        } else if (productName.includes('vestido-ara')) {
          folderName = 'vestido-ara';
        } else if (productName.includes('arabesco')) {
          folderName = 'vestido-arabesco';
        } else if (productName.includes('isabele')) {
          folderName = 'vestido-isabele';
        } else {
          // Se não houver correspondência, defina a pasta padrão
          folderName = 'default';
        }

        // Constrói o caminho completo da imagem
        const imagesWithFullPath = (product.images as string[]).map(
          (imageName) => `/images/${folderName}/${imageName}`,
        );

        // Retorna um novo objeto com o caminho da imagem corrigido
        return new ProductEntity({
          ...product,
          images: imagesWithFullPath,
        });
      });

      return productsWithCorrectPath;
    } catch (error) {
      console.error('Erro ao buscar produtos:', error);
      throw new InternalServerErrorException('Erro ao buscar produtos. Por favor, tente novamente mais tarde.');
    }
  }

  async findFeatured(): Promise<ProductEntity[]> {
    const featuredProducts = await this.prisma.product.findMany({
      where: {
        isFeatured: true,
      },
    });

    return featuredProducts.map(product => new ProductEntity(product));
  }

  async findOne(id: string): Promise<ProductEntity> {
    const product = await this.prisma.product.findUnique({ where: { id } });

    if (!product) {
      throw new NotFoundException(`Produto com ID "${id}" não encontrado.`);
    }

    return new ProductEntity(product);
  }

  async update(id: string, updateProductDto: any): Promise<ProductEntity> {
    throw new Error('Método update ainda não implementado.');
  }

  async remove(id: string): Promise<ProductEntity> {
    try {
      const removedProduct = await this.prisma.product.delete({ where: { id } });
      return new ProductEntity(removedProduct);
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException(`Produto com ID "${id}" não encontrado.`);
      }
      throw error;
    }
  }
}
