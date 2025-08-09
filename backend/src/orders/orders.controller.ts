// src/orders/orders.controller.ts
import { Controller, Post, Body, Param, UseGuards, Get } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { OptionalJwtAuthGuard } from 'src/auth/guards/optional-jwt-auth.guard';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import type { User } from '@prisma/client';

// Aplica o OptionalJwtAuthGuard na classe para que todos os métodos o usem
// Ou aplique individualmente se houver métodos que SÓ podem ser acessados por logados
@UseGuards(OptionalJwtAuthGuard)
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  // MUDANÇA AQUI: createOrderDto vem primeiro, user? vem depois
  async create(@Body() createOrderDto: CreateOrderDto, @CurrentUser() user?: User) {
    // MUDANÇA AQUI: A ordem dos argumentos na chamada ao service foi ajustada
    return this.ordersService.create(createOrderDto, user?.id);
  }

  // Rotas que exigem autenticação ainda podem usar JwtAuthGuard explicitamente
  // ou confiar no OptionalJwtAuthGuard e verificar 'user' dentro do método.
  // Para findAll e findOne, provavelmente você ainda quer que seja para o usuário logado.
  // Se sim, você pode adicionar @UseGuards(JwtAuthGuard) a esses métodos ou
  // remover o OptionalJwtAuthGuard da classe e aplicar individualmente.
  // Mantendo JwtAuthGuard para garantir que essas rotas SÓ funcionem para logados.
  @UseGuards(JwtAuthGuard)
  @Get()
  async findAll(@CurrentUser() user: User) {
    return this.ordersService.findAllByUserId(user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async findOne(@CurrentUser() user: User, @Param('id') id: string) {
    return this.ordersService.findOneByUserId(user.id, id);
  }
}