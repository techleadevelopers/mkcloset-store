// src/payments/providers/pagseguro.service.ts
import { Injectable, BadRequestException, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { Prisma } from '@prisma/client';
import { PixChargeResponseDto } from '../dto/create-pix-charge.dto';
import { Decimal } from '@prisma/client/runtime/library';

// Interface para os detalhes de um item no checkout do PagSeguro
interface PagSeguroCheckoutItem {
  reference_id?: string; // ID de referência do item (opcional)
  name: string;
  quantity: number;
  unit_amount: number; // Valor em centavos
}

// Interface para os detalhes do cliente no checkout do PagSeguro
interface PagSeguroCheckoutCustomer {
  name: string;
  email: string;
  tax_id: string; // CPF
  phones: Array<{
    country: string;
    area: string;
    number: string;
    type: 'MOBILE' | 'HOME' | 'BUSINESS';
  }>;
}

// Interface para o endereço no checkout do PagSeguro
interface PagSeguroCheckoutAddress {
  country: string;
  region_code: string; // Estado (ex: SP)
  city: string;
  postal_code: string; // CEP
  street: string;
  number: string;
  locality: string; // Bairro
  complement?: string | null;
}

// Interface para os detalhes de envio no checkout do PagSeguro
interface PagSeguroCheckoutShipping {
  address: PagSeguroCheckoutAddress;
  type: 'FIXED' | 'FREE' | 'WEIGHT'; // Tipo de frete
  service_type: string; // Serviço de frete (ex: SEDEX, PAC)
  amount: number; // Custo do frete em centavos
  estimated_delivery_time_in_days?: number;
  address_modifiable?: boolean; // Se o cliente pode modificar o endereço na página do PagSeguro
}

// Interface para os detalhes necessários para criar um checkout de redirecionamento
interface CreatePagSeguroCheckoutRedirectDetails {
  orderId: string; // Seu ID de pedido interno, usado como reference_id
  amount: Prisma.Decimal; // Valor total do pedido, incluindo frete
  description: string;
  customer: {
    email: string;
    fullName: string;
    phone?: string | null;
    cpf?: string | null;
  };
  shippingAddress: {
    cep: string;
    street: string;
    number: string;
    complement?: string | null;
    neighborhood: string;
    city: string;
    state: string;
  };
  shippingService: string;
  shippingPrice: Prisma.Decimal;
  items: Array<{
    name: string;
    quantity: number;
    unit_amount: Prisma.Decimal; // Preço unitário do item
  }>;
}

// Interface para os detalhes necessários para criar uma cobrança PIX
interface CreatePagSeguroPixChargeDetails {
  orderId: string;
  amount: Prisma.Decimal;
  description: string;
  customer: {
    email: string;
    fullName: string;
    phone?: string | null;
    cpf?: string | null;
  };
  shippingAddress: {
    cep: string;
    street: string;
    number: string;
    complement?: string | null;
    neighborhood: string;
    city: string;
    state: string;
  };
  shippingService: string;
  shippingPrice: Prisma.Decimal;
  items: Array<{
    name: string;
    quantity: number;
    unit_amount: Prisma.Decimal;
  }>;
}

// NOVO: Interface para os detalhes necessários para processar pagamento direto com cartão
interface CreatePagSeguroCreditCardChargeDetails {
  orderId: string;
  amount: Prisma.Decimal;
  description: string;
  customer: {
    email: string;
    fullName: string;
    phone?: string | null;
    cpf?: string | null;
  };
  shippingAddress: {
    cep: string;
    street: string;
    number: string;
    complement?: string | null;
    neighborhood: string;
    city: string;
    state: string;
  };
  shippingService: string;
  shippingPrice: Prisma.Decimal;
  items: Array<{
    name: string;
    quantity: number;
    unit_amount: Prisma.Decimal;
  }>;
  cardDetails: {
    token: string; // Token gerado no frontend
    holderName: string;
    cpf: string;
    installments?: number;
  };
}

@Injectable()
export class PagSeguroService {
  private readonly logger = new Logger(PagSeguroService.name);
  private pagSeguroBaseApiUrl: string; // URL base da API (sem /checkouts)
  private pagSeguroToken: string;
  private pagSeguroEmail: string; // Email da conta PagSeguro, se necessário para alguma API
  private redirectBaseUrl: string; // URL base do frontend (ngrok)
  private notificationBaseUrl: string; // URL base do backend (ngrok)

  constructor(private configService: ConfigService) {
    // Carrega a URL base da API do PagSeguro (ex: https://sandbox.api.pagseguro.com)
    this.pagSeguroBaseApiUrl = this.configService.get<string>('PAGSEGURO_API_URL') || 'https://sandbox.api.pagseguro.com';
    this.pagSeguroToken = this.configService.get<string>('PAGSEGURO_API_TOKEN')!;
    this.pagSeguroEmail = this.configService.get<string>('PAGSEGURO_EMAIL')!; // Pode ser necessário para APIs mais antigas ou específicas

    // Carrega as URLs do ngrok do .env
    this.redirectBaseUrl = this.configService.get<string>('FRONTEND_URL')!; // Usando FRONTEND_URL
    this.notificationBaseUrl = this.configService.get<string>('BACKEND_URL')!; // Usando BACKEND_URL

    // Validação de configuração
    if (!this.pagSeguroToken || !this.redirectBaseUrl || !this.notificationBaseUrl) {
      this.logger.error('Credenciais e/ou URLs do PagSeguro não configuradas corretamente. Verifique PAGSEGURO_API_TOKEN, FRONTEND_URL, BACKEND_URL no seu .env.');
      throw new InternalServerErrorException('Credenciais e/ou URLs do PagSeguro não configuradas.');
    }
  }

  // Este método createSession parece ser para uma API mais antiga do PagSeguro (V2)
  // Se você está usando a API V4 (como sugere 'x-api-version': '4.0'),
  // talvez não precise dele para o fluxo de checkout de redirecionamento.
  // Mantenho-o aqui, mas com a URL correta para V2.
  async createSession() {
    const sessionUrl = `https://ws.sandbox.pagseguro.uol.com.br/v2/sessions?email=${this.pagSeguroEmail}&token=${this.pagSeguroToken}`;
    
    try {
      const response = await axios.post(sessionUrl);
      // O retorno pode precisar ser parseado de XML para JSON, dependendo da API V2
      this.logger.log(`[PagSeguroService] Sessão PagSeguro criada: ${JSON.stringify(response.data)}`);
      return response.data; // Retorna o ID da sessão
    } catch (error) {
      this.logger.error('Erro ao criar sessão no PagSeguro:', error.message);
      if (axios.isAxiosError(error) && error.response) {
        this.logger.error(`[PagSeguroService] Dados do erro da API PagSeguro (sessão): ${JSON.stringify(error.response.data)}`);
      }
      throw new InternalServerErrorException('Falha ao criar sessão no PagSeguro.');
    }
  }

  // NOVO: Método para criar uma cobrança PIX
  async createPagSeguroPixCharge(details: CreatePagSeguroPixChargeDetails): Promise<PixChargeResponseDto> {
    this.logger.log(`[PagSeguroService] Criando cobrança PIX para o pedido ${details.orderId}`);

    const cleanedPhone = details.customer.phone ? details.customer.phone.replace(/\D/g, '') : '';
    let customerPhoneArea: string;
    let customerPhoneNumber: string;
    let customerPhoneType: 'MOBILE' | 'HOME' | 'BUSINESS';

    // Lógica para telefone de teste em sandbox ou telefone real
    const isSandbox = this.pagSeguroBaseApiUrl.includes('sandbox'); 
    if (isSandbox) {
      customerPhoneArea = '11'; 
      customerPhoneNumber = '999999999'; // Telefone de teste comum para sandbox
      customerPhoneType = 'MOBILE';
      this.logger.debug(`[PagSeguroService] Usando telefone de teste para sandbox: (${customerPhoneArea}) ${customerPhoneNumber}`);
    } else {
      if (cleanedPhone.length >= 10) {
          customerPhoneArea = cleanedPhone.substring(0, 2);
          customerPhoneNumber = cleanedPhone.substring(2);
          customerPhoneType = customerPhoneNumber.length === 9 ? 'MOBILE' : 'HOME';
      } else {
          this.logger.warn(`[PagSeguroService] Telefone do cliente (${details.customer.phone}) é inválido. Usando fallback.`);
          customerPhoneArea = '11'; 
          customerPhoneNumber = '999999999';
          customerPhoneType = 'MOBILE';
      }
    }

    const customerTaxId = (details.customer.cpf || '30061150827').replace(/\D/g, ''); 
    const finalCustomerTaxId = customerTaxId.length === 11 ? customerTaxId : '30061150827';

    const itemsPayload: PagSeguroCheckoutItem[] = details.items.map(item => ({
      name: item.name,
      quantity: item.quantity,
      unit_amount: Math.round(item.unit_amount.toNumber() * 100),
    }));

    // --- INÍCIO DA ALTERAÇÃO PARA PIX QR CODE ---
    const payload = {
      reference_id: details.orderId,
      customer: {
        name: details.customer.fullName,
        email: details.customer.email,
        tax_id: finalCustomerTaxId,
        phones: [{
          country: '55',
          area: customerPhoneArea,
          number: customerPhoneNumber,
          type: customerPhoneType,
        }],
      },
      items: itemsPayload,
      // REMOVIDO: o objeto 'charges' para PIX QR Code
      qr_codes: [ // ADICIONADO: o objeto 'qr_codes' conforme a documentação
        {
          amount: { 
            value: Math.round(details.amount.toNumber() * 100) // Valor total do pedido em centavos
          },
          expiration_date: new Date(Date.now() + 60 * 60 * 1000).toISOString(), // 1 hora de expiração (opcional, PagSeguro padrão 24h)
        },
      ],
      notification_urls: [`${this.notificationBaseUrl}/payments/webhook/pagseguro`],
      // Você pode adicionar o objeto 'shipping' aqui se for relevante para o pedido geral,
      // mas não é estritamente necessário para a criação do QR Code em si.
      // shipping: { ... }
    };
    // --- FIM DA ALTERAÇÃO PARA PIX QR CODE ---

    this.logger.debug(`[PagSeguroService] Enviando payload para PagSeguro (${this.pagSeguroBaseApiUrl}/orders): ${JSON.stringify(payload)}`);

    try {
      const response = await axios.post(`${this.pagSeguroBaseApiUrl}/orders`, payload, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.pagSeguroToken}`,
          'x-api-version': '4.0',
        },
      });

      this.logger.log(`[PagSeguroService] Cobrança PIX criada com sucesso para o pedido ${details.orderId}.`);
      
      // --- INÍCIO DA ALTERAÇÃO PARA PARSEAR RESPOSTA PIX QR CODE ---
      const qrCodeResponse = response.data.qr_codes?.[0]; // QR Code está diretamente em 'qr_codes' na resposta
      
      if (!qrCodeResponse) {
        throw new InternalServerErrorException('Resposta inválida do PagSeguro: QR Code não encontrado na resposta do pedido.');
      }

      return {
        transactionId: response.data.id, // O ID do pedido é o transactionId principal
        status: 'PENDING', // PIX é geralmente PENDING inicialmente
        brCode: qrCodeResponse.text, // O código PIX (copia e cola)
        qrCodeImage: qrCodeResponse.links?.find((link: any) => link.rel === 'QR_CODE_IMAGE')?.href, // URL da imagem do QR Code
        expiresAt: qrCodeResponse.expiration_date, // Data de expiração do QR Code
        amount: details.amount.toNumber(),
        description: details.description,
        orderId: details.orderId,
      };
      // --- FIM DA ALTERAÇÃO PARA PARSEAR RESPOSTA PIX QR CODE ---

    } catch (error) {
      this.logger.error(`[PagSeguroService] Erro ao criar cobrança PIX para o pedido ${details.orderId}: ${error.message}`);
      if (axios.isAxiosError(error) && error.response) {
        this.logger.error(`[PagSeguroService] Dados do erro da API PagSeguro: ${JSON.stringify(error.response.data)}`);
        const pagseguroErrorMessage = error.response.data?.error_messages?.[0]?.description || error.response.data?.message || 'Erro desconhecido do PagSeguro.';
        throw new InternalServerErrorException(`Falha no PagSeguro: ${pagseguroErrorMessage}`);
      }
      throw new InternalServerErrorException('Falha ao criar cobrança PIX com PagSeguro.');
    }
  }

  // NOVO: Método para processar pagamento direto com cartão de crédito
  async processDirectCreditCardPayment(details: CreatePagSeguroCreditCardChargeDetails): Promise<any> {
    this.logger.log(`[PagSeguroService] Processando pagamento com cartão para o pedido ${details.orderId}`);

    const cleanedPhone = details.customer.phone ? details.customer.phone.replace(/\D/g, '') : '';
    let customerPhoneArea: string;
    let customerPhoneNumber: string;
    let customerPhoneType: 'MOBILE' | 'HOME' | 'BUSINESS';

    if (cleanedPhone.length >= 10) {
        customerPhoneArea = cleanedPhone.substring(0, 2);
        customerPhoneNumber = cleanedPhone.substring(2);
        customerPhoneType = customerPhoneNumber.length === 9 ? 'MOBILE' : 'HOME';
    } else {
        this.logger.warn(`[PagSeguroService] Telefone do cliente (${details.customer.phone}) é inválido. Usando fallback.`);
        customerPhoneArea = '11'; 
        customerPhoneNumber = '999999999';
        customerPhoneType = 'MOBILE';
    }

    const customerTaxId = (details.customer.cpf || '30061150827').replace(/\D/g, ''); 
    const finalCustomerTaxId = customerTaxId.length === 11 ? customerTaxId : '30061150827';

    const itemsPayload: PagSeguroCheckoutItem[] = details.items.map(item => ({
      name: item.name,
      quantity: item.quantity,
      unit_amount: Math.round(item.unit_amount.toNumber() * 100),
    }));

    const stateUfMap: { [key: string]: string } = {
      'Acre': 'AC', 'Alagoas': 'AL', 'Amapá': 'AP', 'Amazonas': 'AM', 'Bahia': 'BA',
      'Ceará': 'CE', 'Distrito Federal': 'DF', 'Espírito Santo': 'ES', 'Goiás': 'GO',
      'Maranhão': 'MA', 'Mato Grosso': 'MT', 'Mato Grosso do Sul': 'MS', 'Minas Gerais': 'MG',
      'Pará': 'PA', 'Paraíba': 'PB', 'Paraná': 'PR', 'Pernambuco': 'PE', 'Piauí': 'PI',
      'Rio de Janeiro': 'RJ', 'Rio Grande do Norte': 'RN', 'Rio Grande do Sul': 'RS',
      'Rondônia': 'RO', 'Roraima': 'RR', 'Santa Catarina': 'SC', 'São Paulo': 'SP',
      'Sergipe': 'SE', 'Tocantins': 'TO'
    };
    const regionCode = stateUfMap[details.shippingAddress.state] || details.shippingAddress.state.toUpperCase();

    const payload = {
      reference_id: details.orderId,
      customer: {
        name: details.customer.fullName,
        email: details.customer.email,
        tax_id: finalCustomerTaxId,
        phones: [{
          country: '55',
          area: customerPhoneArea,
          number: customerPhoneNumber,
          type: customerPhoneType,
        }],
      },
      items: itemsPayload,
      shipping: {
        address: {
          country: 'BRA',
          region_code: regionCode, 
          city: details.shippingAddress.city,
          postal_code: details.shippingAddress.cep.replace(/\D/g, ''), 
          street: details.shippingAddress.street,
          number: details.shippingAddress.number,
          locality: details.shippingAddress.neighborhood,
          complement: details.shippingAddress.complement || null,
        },
        amount: Math.round(details.shippingPrice.toNumber() * 100), 
        // type e service_type podem ser mais genéricos para pagamentos diretos
        type: 'FIXED', 
        service_type: 'STANDARD', 
      },
      charges: [{
        reference_id: details.orderId,
        description: details.description,
        amount: { value: Math.round(details.amount.toNumber() * 100) },
        payment_method: {
          type: 'CREDIT_CARD',
          installments: details.cardDetails.installments || 1,
          capture: true, // Captura imediata
          card: {
            token: details.cardDetails.token,
            holder: {
              name: details.cardDetails.holderName,
              tax_id: details.cardDetails.cpf.replace(/\D/g, ''),
            },
          },
        },
      }],
      notification_urls: [`${this.notificationBaseUrl}/payments/webhook/pagseguro`],
    };

    this.logger.debug(`[PagSeguroService] Enviando payload para PagSeguro (Direct Card): ${JSON.stringify(payload)}`);

    try {
      const response = await axios.post(`${this.pagSeguroBaseApiUrl}/orders`, payload, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.pagSeguroToken}`,
          'x-api-version': '4.0',
        },
      });

      this.logger.log(`[PagSeguroService] Pagamento com cartão processado com sucesso para o pedido ${details.orderId}.`);
      
      const charge = response.data.charges?.[0];
      if (!charge) {
        throw new InternalServerErrorException('Resposta inválida do PagSeguro: charge não encontrada.');
      }

      return {
        transactionId: response.data.id,
        status: charge.status, // APPROVED, PENDING, DECLINED, etc.
        transactionRef: charge.id, // ID da cobrança
        amount: details.amount.toNumber(),
        description: details.description,
        orderId: details.orderId,
      };

    } catch (error) {
      this.logger.error(`[PagSeguroService] Erro ao processar pagamento com cartão para o pedido ${details.orderId}: ${error.message}`);
      if (axios.isAxiosError(error) && error.response) {
        this.logger.error(`[PagSeguroService] Dados do erro da API PagSeguro (Direct Card): ${JSON.stringify(error.response.data)}`);
        const pagseguroErrorMessage = error.response.data?.error_messages?.[0]?.description || error.response.data?.message || 'Erro desconhecido do PagSeguro.';
        throw new InternalServerErrorException(`Falha no PagSeguro: ${pagseguroErrorMessage}`);
      }
      throw new InternalServerErrorException('Falha ao processar pagamento direto com cartão de crédito via PagSeguro.');
    }
  }


  async createPagSeguroCheckoutRedirect(details: CreatePagSeguroCheckoutRedirectDetails): Promise<{ redirectUrl: string; pagSeguroCheckoutId: string }> {
    this.logger.log(`[PagSeguroService] Criando checkout de redirecionamento para o pedido ${details.orderId}`);
    this.logger.debug(`[PagSeguroService] Raw customer phone: ${details.customer.phone}`); 

    let customerPhoneArea: string;
    let customerPhoneNumber: string;
    let customerPhoneType: 'MOBILE' | 'HOME' | 'BUSINESS';

    const isSandbox = this.pagSeguroBaseApiUrl.includes('sandbox'); 

    if (isSandbox) {
        customerPhoneArea = '11'; 
        customerPhoneNumber = '30335000'; 
        customerPhoneType = 'HOME';
        this.logger.debug(`[PagSeguroService] Usando telefone de teste para sandbox: (${customerPhoneArea}) ${customerPhoneNumber}`);
    } else {
        const cleanedPhone = details.customer.phone ? details.customer.phone.replace(/\D/g, '') : '';
        if (cleanedPhone.length >= 10) { 
            customerPhoneArea = cleanedPhone.substring(0, 2);
            customerPhoneNumber = cleanedPhone.substring(2);
            customerPhoneType = customerPhoneNumber.length === 9 ? 'MOBILE' : 'HOME'; 
        } else { 
            this.logger.warn(`[PagSeguroService] Telefone do cliente (${details.customer.phone}) é inválido. Usando fallback.`);
            customerPhoneArea = '11'; 
            customerPhoneNumber = '999999999'; 
            customerPhoneType = 'MOBILE';
        }
    }
    
    const customerTaxId = (details.customer.cpf || '30061150827').replace(/\D/g, ''); 
    const finalCustomerTaxId = customerTaxId.length === 11 ? customerTaxId : '30061150827'; 

    const stateUfMap: { [key: string]: string } = {
      'Acre': 'AC', 'Alagoas': 'AL', 'Amapá': 'AP', 'Amazonas': 'AM', 'Bahia': 'BA',
      'Ceará': 'CE', 'Distrito Federal': 'DF', 'Espírito Santo': 'ES', 'Goiás': 'GO',
      'Maranhão': 'MA', 'Mato Grosso': 'MT', 'Mato Grosso do Sul': 'MS', 'Minas Gerais': 'MG',
      'Pará': 'PA', 'Paraíba': 'PB', 'Paraná': 'PR', 'Pernambuco': 'PE', 'Piauí': 'PI',
      'Rio de Janeiro': 'RJ', 'Rio Grande do Norte': 'RN', 'Rio Grande do Sul': 'RS',
      'Rondônia': 'RO', 'Roraima': 'RR', 'Santa Catarina': 'SC', 'São Paulo': 'SP',
      'Sergipe': 'SE', 'Tocantins': 'TO'
    };
    const regionCode = stateUfMap[details.shippingAddress.state] || details.shippingAddress.state.toUpperCase();
    if (regionCode.length !== 2) {
        this.logger.warn(`[PagSeguroService] Código de região inválido para o estado: ${details.shippingAddress.state}. Enviado: ${regionCode}`);
    }


    const shippingServiceMap: { [key: string]: string } = {
      '4014': 'SEDEX', 
      '41106': 'PAC',  
      'FIXED': 'FIXED', 
    };
    const pagSeguroShippingService = shippingServiceMap[details.shippingService] || details.shippingService;


    const shippingAddressPayload: PagSeguroCheckoutAddress = {
      country: 'BRA',
      region_code: regionCode, 
      city: details.shippingAddress.city,
      postal_code: details.shippingAddress.cep.replace(/\D/g, ''), 
      street: details.shippingAddress.street,
      number: details.shippingAddress.number,
      locality: details.shippingAddress.neighborhood,
      complement: details.shippingAddress.complement || null,
    };

    const itemsPayload: PagSeguroCheckoutItem[] = details.items.map(item => ({
      name: item.name,
      quantity: item.quantity,
      unit_amount: Math.round(item.unit_amount.toNumber() * 100), 
    }));

    const payload = {
      reference_id: details.orderId,
      customer: {
        name: details.customer.fullName,
        email: details.customer.email,
        tax_id: finalCustomerTaxId, 
        phones: [
          {
            country: '55',
            area: customerPhoneArea, 
            number: customerPhoneNumber, 
            type: customerPhoneType, 
          },
        ],
      },
      items: itemsPayload,
      shipping: {
        address: shippingAddressPayload,
        type: 'FIXED', 
        service_type: pagSeguroShippingService, 
        amount: Math.round(details.shippingPrice.toNumber() * 100), 
        address_modifiable: false,
      },
      redirect_url: `${this.redirectBaseUrl}/order-success?orderId=${details.orderId}`, 
      notification_urls: [`${this.notificationBaseUrl}/payments/webhook/pagseguro`], 
      description: details.description,
      customer_modifiable: false,
      address_modifiable: false,
    };

    this.logger.debug(`[PagSeguroService] Enviando payload para PagSeguro (${this.pagSeguroBaseApiUrl}/checkouts): ${JSON.stringify(payload)}`);

    try {
      const response = await axios.post(`${this.pagSeguroBaseApiUrl}/checkouts`, payload, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.pagSeguroToken}`,
          'x-api-version': '4.0', 
        },
      });

      this.logger.log(`[PagSeguroService] Checkout de redirecionamento criado com sucesso para order ${details.orderId}.`);

      const checkoutId = response.data.id;
      const payLink = response.data.links?.find((link: any) => link.rel === 'PAY');

      if (!payLink || !payLink.href) {
        this.logger.error(`[PagSeguroService] Resposta inválida do PagSeguro (link PAY ausente): ${JSON.stringify(response.data)}`);
        throw new InternalServerErrorException('Falha ao obter link de pagamento do PagSeguro. Resposta incompleta.');
      }

      return {
        redirectUrl: payLink.href,
        pagSeguroCheckoutId: checkoutId,
      };
    } catch (error) {
      this.logger.error(`[PagSeguroService] Erro ao criar checkout de redirecionamento para order ${details.orderId}: ${error.message}`);
      if (axios.isAxiosError(error) && error.response) {
        this.logger.error(`[PagSeguroService] Dados do erro da API PagSeguro: ${JSON.stringify(error.response.data)}`);
        const pagseguroErrorMessage = error.response.data?.error_messages?.[0]?.description || error.response.data?.message || 'Erro desconhecido do PagSeguro.';
        throw new InternalServerErrorException(`Falha no PagSeguro: ${pagseguroErrorMessage}`);
      }
      throw new InternalServerErrorException('Falha ao criar checkout de redirecionamento com PagSeguro.');
    }
  }

  async getCheckoutDetails(pagSeguroCheckoutId: string): Promise<any> {
    this.logger.log(`[PagSeguroService] Buscando detalhes do checkout PagSeguro: ${pagSeguroCheckoutId}`);

    const url = `${this.pagSeguroBaseApiUrl}/checkouts/${pagSeguroCheckoutId}`;

    try {
      const response = await axios.get(url, {
        headers: {
          'Authorization': `Bearer ${this.pagSeguroToken}`,
          'x-api-version': '4.0',
        },
      });
      this.logger.log(`[PagSeguroService] Detalhes do checkout ${pagSeguroCheckoutId} obtidos com sucesso.`);
      return response.data;
    } catch (error) {
      this.logger.error(`[PagSeguroService] Erro ao buscar detalhes do checkout PagSeguro ${pagSeguroCheckoutId}:`, error.response?.data || error.message);
      if (axios.isAxiosError(error) && error.response && error.response.status === 404) {
        throw new NotFoundException(`Checkout PagSeguro com ID "${pagSeguroCheckoutId}" não encontrado.`);
      }
      throw new InternalServerErrorException('Falha ao consultar detalhes do checkout PagSeguro.');
    }
  }

  // NOVO: Método para iniciar um reembolso
  async initiateRefund(transactionId: string, amount?: number): Promise<any> {
    this.logger.log(`[PagSeguroService] Iniciando reembolso para a transação ${transactionId}, valor: ${amount || 'total'}`);

    // A API de reembolso do PagSeguro pode variar. Este é um exemplo hipotético.
    // Você precisará consultar a documentação oficial do PagSeguro para a API de reembolso (API de Transações V4 ou V5).
    const refundUrl = `${this.pagSeguroBaseApiUrl}/charges/${transactionId}/cancel`; // Exemplo para cancelar uma cobrança (reembolso total)
    // Se for reembolso parcial, a rota e o payload podem ser diferentes.

    const payload: any = {};
    if (amount) {
        payload.amount = { value: Math.round(amount * 100) }; // Reembolso parcial
    }

    try {
        const response = await axios.post(refundUrl, payload, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.pagSeguroToken}`,
                'x-api-version': '4.0', // Ou a versão da API de reembolso
            },
        });
        this.logger.log(`[PagSeguroService] Reembolso iniciado com sucesso para transação ${transactionId}.`);
        return response.data;
    } catch (error) {
        this.logger.error(`[PagSeguroService] Erro ao iniciar reembolso para transação ${transactionId}: ${error.message}`);
        if (axios.isAxiosError(error) && error.response) {
            this.logger.error(`[PagSeguroService] Dados do erro da API PagSeguro (reembolso): ${JSON.stringify(error.response.data)}`);
            const pagseguroErrorMessage = error.response.data?.error_messages?.[0]?.description || error.response.data?.message || 'Erro desconhecido do PagSeguro.';
            throw new InternalServerErrorException(`Falha no PagSeguro ao reembolsar: ${pagseguroErrorMessage}`);
        }
        throw new InternalServerErrorException('Falha ao iniciar reembolso com PagSeguro.');
    }
  }
}