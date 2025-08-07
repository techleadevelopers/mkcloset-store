import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { CartService } from './cart.service';
import { AddToCartDto } from './dto/add-to-cart.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import type { User } from '@prisma/client'; // Importa o tipo User do Prisma

@UseGuards(JwtAuthGuard)
@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get()
  async getCart(@CurrentUser() user: User) {
    return this.cartService.getOrCreateCart(user.id);
  }

  @Post('items')
  async addItemToCart(@CurrentUser() user: User, @Body() addToCartDto: AddToCartDto) {
    return this.cartService.addItemToCart(user.id, addToCartDto);
  }

  @Patch('items/:itemId')
  async updateCartItemQuantity(@CurrentUser() user: User, @Param('itemId') itemId: string, @Body() updateCartItemDto: UpdateCartItemDto) {
    return this.cartService.updateCartItemQuantity(user.id, itemId, updateCartItemDto.quantity);
  }

  @Delete('items/:itemId')
  async removeCartItem(@CurrentUser() user: User, @Param('itemId') itemId: string) {
    return this.cartService.removeCartItem(user.id, itemId);
  }

  @Delete('clear')
  async clearCart(@CurrentUser() user: User) {
    return this.cartService.clearCart(user.id);
  }
}