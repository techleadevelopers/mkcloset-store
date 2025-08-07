import { IsNotEmpty, IsString, IsOptional, IsJSON } from 'class-validator';
import { IsObject } from 'class-validator'; // Para validar paymentDetails como objeto

export class CreateOrderDto {
  @IsNotEmpty()
  @IsString()
  paymentMethod: string; // Ex: 'credit_card', 'pix', 'boleto'

  @IsOptional()
  @IsObject() // Valida que é um objeto
  paymentDetails?: object; // Detalhes específicos do gateway de pagamento (ex: token do cartão, dados do Pix)

  @IsNotEmpty()
  @IsString()
  shippingAddressId: string; // ID do endereço de entrega selecionado pelo usuário
}