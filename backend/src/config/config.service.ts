import { Injectable } from '@nestjs/common';
import { ConfigService as NestConfigService } from '@nestjs/config';

@Injectable()
export class ConfigService {
  constructor(private nestConfigService: NestConfigService) {}

  get databaseUrl(): string {
    return this.nestConfigService.get<string>('DATABASE_URL') || '';
  }

  get jwtSecret(): string {
    return this.nestConfigService.get<string>('JWT_SECRET') || 'supersecretkey';
  }

  get jwtExpiresIn(): string {
    return this.nestConfigService.get<string>('JWT_EXPIRES_IN') || '1h';
  }

  get stripeSecretKey(): string {
    return this.nestConfigService.get<string>('STRIPE_SECRET_KEY') || '';
  }

  get correiosApiUrl(): string {
    return this.nestConfigService.get<string>('CORREIOS_API_URL') || '';
  }

  // --- Configurações do PagSeguro ---
  get pagSeguroApiUrl(): string {
    return this.nestConfigService.get<string>('PAGSEGURO_API_URL') || 'https://api.pagseguro.com';
  }

  get pagSeguroApiToken(): string {
    const token = this.nestConfigService.get<string>('PAGSEGURO_API_TOKEN');
    if (!token) {
        throw new Error('A variável de ambiente PAGSEGURO_API_TOKEN não está definida.');
    }
    return token;
  }
  // -----------------------------------
}