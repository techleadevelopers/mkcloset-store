// src/payments/dto/process-payment.dto.ts

import { IsEnum, IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional, ApiProperty } from '@nestjs/swagger';

// Este enum deve ser o mesmo que o seu serviço espera
enum PaymentMethod {
  PIX = 'PIX',
  CREDIT_CARD = 'CREDIT_CARD',
  BOLETO = 'BOLETO',
}

export class ProcessPaymentDto {
  @ApiProperty({ enum: PaymentMethod })
  @IsEnum(PaymentMethod, {
    message: 'paymentMethod deve ser um dos seguintes valores: PIX, CREDIT_CARD, BOLETO',
  })
  paymentMethod: PaymentMethod;

  @ApiPropertyOptional({ example: '123.456.789-00' })
  @IsOptional()
  @IsString()
  clientCpf?: string;

  @ApiPropertyOptional({ example: '11999999999' })
  @IsOptional()
  @IsString()
  clientPhone?: string;
}