import { Module } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { PaymentsController } from './payments.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { OrdersModule } from 'src/orders/orders.module';
import { ConfigModule } from 'src/config/config.module';
import { PagSeguroService } from './providers/pagseguro.service'; // Importa o serviço PagSeguro

@Module({
  imports: [PrismaModule, OrdersModule, ConfigModule],
  controllers: [PaymentsController],
  providers: [PaymentsService, PagSeguroService], // Adicionado PagSeguroService
  exports: [PaymentsService],
})
export class PaymentsModule {}