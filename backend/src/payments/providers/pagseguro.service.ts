import { Injectable, BadRequestException, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config'; // Importe o ConfigService padrão do NestJS
import axios from 'axios'; // Importar axios para fazer as requisições HTTP

// Tipagem auxiliar para os detalhes do cliente e do pedido
interface PagSeguroPixDetails {
  orderId: string;
  amount: number; // Será convertido para Prisma.Decimal no PaymentsService
  description: string;
  clientEmail: string;
  clientFullName: string;
  clientPhone?: string | null;
  clientCpf?: string | null;
  clientAddress?: {
    cep: string;
    street: string;
    number: string;
    complement?: string | null;
    neighborhood: string;
    city: string;
    state: string;
  } | null;
  notificationUrl: string; // URL do webhook da sua aplicação
}

@Injectable()
export class PagSeguroService {
  private readonly logger = new Logger(PagSeguroService.name);
  private pagSeguroApiUrl: string;
  private pagSeguroToken: string;

  constructor(private configService: ConfigService) {
    // Obtenha as credenciais do PagSeguro do seu ConfigService usando o método get()
    this.pagSeguroApiUrl = this.configService.get<string>('PAGSEGURO_API_URL') || 'https://sandbox.api.pagseguro.com';
    const pagSeguroToken = this.configService.get<string>('PAGSEGURO_API_TOKEN');

    if (!pagSeguroToken) {
      this.logger.error('PAGSEGURO_API_TOKEN não configurado. As integrações com PagSeguro não funcionarão.');
      throw new InternalServerErrorException('Credenciais do PagSeguro não configuradas.');
    }
    this.pagSeguroToken = pagSeguroToken;
  }

  /**
   * Simula ou processa um pagamento com cartão de crédito via PagSeguro.
   * A lógica real para a API de Pedidos do PagSeguro seria diferente da comentada.
   * Mantido como simulado por enquanto, pois o foco é PIX.
   */
  async processCreditCardPayment(amount: number, paymentDetails: any, orderId: string, userId: string): Promise<any> {
    this.logger.log(`Simulando processamento de cartão de crédito PagSeguro para o pedido ${orderId}: ${amount}`);
    // A integração real com a API de Pedidos do PagSeguro para cartão de crédito
    // exigiria um payload diferente e tratamento de tokenização no frontend.
    return { status: 'PENDING', transactionId: `ps_sim_cc_${Date.now()}`, message: 'Pagamento de cartão em análise.' };
  }

  /**
   * Gera um QR Code Pix via PagSeguro utilizando a API de Pedidos (/orders).
   * @param details Objeto contendo todos os dados necessários para a cobrança PIX.
   */
  async generatePixPayment(details: PagSeguroPixDetails): Promise<any> {
    this.logger.log(`[PagSeguroService] Gerando PIX para o pedido ${details.orderId} com valor ${details.amount}`);

    const url = `${this.pagSeguroApiUrl}/orders`;

    try {
      // ATENÇÃO: Em produção, garanta que clientCpf, clientPhone e dados de endereço sejam reais e válidos.
      // Os valores padrão abaixo são apenas para simulação/desenvolvimento ou caso os dados sejam opcionais.
      const customerTaxId = details.clientCpf || '30061150827'; // CPF de teste ou um CPF válido do cliente
      const customerPhoneArea = details.clientPhone ? details.clientPhone.substring(0, 2) : '11';
      const customerPhoneNumber = details.clientPhone && details.clientPhone.length >= 11 ? details.clientPhone.substring(2) : '999999999';

      const addressPayload: any = {
        street: details.clientAddress?.street || 'Rua Teste',
        number: details.clientAddress?.number || '123',
        locality: details.clientAddress?.neighborhood || 'Bairro Teste',
        city: details.clientAddress?.city || 'Cidade Teste',
        region_code: details.clientAddress?.state || 'SP',
        country: 'BRA',
        postal_code: details.clientAddress?.cep || '00000000',
      };

      if (details.clientAddress?.complement && details.clientAddress.complement.trim() !== '') {
        addressPayload.complement = details.clientAddress.complement;
      }

      const payload = {
        reference_id: details.orderId,
        customer: {
          name: details.clientFullName,
          email: details.clientEmail,
          tax_id: customerTaxId,
          phones: [
            {
              country: '55',
              area: customerPhoneArea,
              number: customerPhoneNumber,
              type: 'MOBILE',
            },
          ],
        },
        items: [
          {
            name: details.description,
            quantity: 1,
            unit_amount: Math.round(details.amount * 100), // Valor em centavos
          },
        ],
        qr_codes: [
          {
            amount: {
              value: Math.round(details.amount * 100), // Valor em centavos
            },
            expiration_date: new Date(Date.now() + 3600 * 1000).toISOString(), // Expira em 1 hora
          },
        ],
        shipping: {
          address: addressPayload,
        },
        notification_urls: [details.notificationUrl], // URL do seu webhook
      };

      this.logger.debug(`[PagSeguroService] Enviando payload para PagSeguro (/orders): ${JSON.stringify(payload)}`);

      const response = await axios.post(url, payload, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.pagSeguroToken}`,
        },
      });

      this.logger.log(`[PagSeguroService] Pedido PIX criado com sucesso para order ${details.orderId}.`);

      // Extrair dados relevantes da resposta do PagSeguro
      const gatewayTransactionId = response.data.id; // ID do pedido no PagSeguro
      const pixQrCodeData = response.data.qr_codes?.[0];
      const brCode = pixQrCodeData?.text;
      const qrCodeImageLink = pixQrCodeData?.links?.find(link => link.rel === 'qr_code_png');
      const qrCodeImage = qrCodeImageLink?.href;
      const expiresAtDate = pixQrCodeData?.expiration_date ? new Date(pixQrCodeData.expiration_date) : new Date(Date.now() + 3600 * 1000);

      if (!brCode || !qrCodeImage || !gatewayTransactionId) {
        this.logger.error(`[PagSeguroService] Resposta inválida do PagSeguro (dados PIX incompletos): ${JSON.stringify(response.data)}`);
        throw new InternalServerErrorException('Falha ao gerar dados de PIX. Resposta incompleta do gateway.');
      }

      return {
        status: 'PENDING', // PagSeguro retorna PENDING inicialmente para PIX
        transactionId: gatewayTransactionId, // ID do pedido do PagSeguro
        brCode: brCode,
        qrCodeImage: qrCodeImage,
        expiresAt: expiresAtDate.toISOString(),
        rawResponse: response.data,
      };
    } catch (error) {
      this.logger.error(`[PagSeguroService] Erro ao gerar PIX para order ${details.orderId}: ${error.message}`);
      if (axios.isAxiosError(error) && error.response) {
        this.logger.error(`[PagSeguroService] Dados do erro da API PagSeguro: ${JSON.stringify(error.response.data)}`);
        const pagseguroErrorMessage = error.response.data?.error_messages?.[0]?.description || error.response.data?.message || 'Erro desconhecido do PagSeguro.';
        throw new InternalServerErrorException(`Falha no PagSeguro: ${pagseguroErrorMessage}`);
      }
      throw new InternalServerErrorException('Falha ao gerar cobrança PIX com PagSeguro.');
    }
  }

  /**
   * Simula ou gera um Boleto via PagSeguro.
   * Mantido como simulado por enquanto.
   */
  async generateBoletoPayment(amount: number, orderId: string, userId: string): Promise<any> {
    this.logger.log(`Simulando geração de Boleto PagSeguro para o pedido ${orderId}: ${amount}`);
    // A integração real com a API de Pedidos do PagSeguro para Boleto
    // exigiria um payload diferente.
    return {
      status: 'PENDING',
      transactionId: `boleto_sim_${Date.now()}`,
      barcode: '12345678901234567890123456789012345678901234',
      boletoUrl: 'https://pagseguro.uol.com.br/boleto/simulado',
      expiresAt: new Date(Date.now() + 5 * 24 * 3600 * 1000),
      message: 'Boleto gerado com sucesso. Aguardando pagamento.',
    };
  }

  /**
   * Busca os detalhes de uma notificação do PagSeguro (para a API de Pedidos).
   * O `notificationCode` aqui será o `orderId` que o PagSeguro envia no webhook.
   * @param orderId O ID do pedido do PagSeguro recebido no webhook.
   */
  async getNotificationDetails(orderId: string): Promise<any> {
    this.logger.log(`[PagSeguroService] Buscando detalhes do pedido PagSeguro: ${orderId}`);

    const url = `${this.pagSeguroApiUrl}/orders/${orderId}`;

    try {
      const response = await axios.get(url, {
        headers: {
          'Authorization': `Bearer ${this.pagSeguroToken}`,
        },
      });
      this.logger.log(`[PagSeguroService] Detalhes do pedido ${orderId} obtidos com sucesso.`);
      return response.data; // Retorna os detalhes completos do pedido
    } catch (error) {
      this.logger.error(`[PagSeguroService] Erro ao buscar detalhes do pedido PagSeguro ${orderId}:`, error.response?.data || error.message);
      if (axios.isAxiosError(error) && error.response && error.response.status === 404) {
        throw new NotFoundException(`Pedido PagSeguro com ID "${orderId}" não encontrado.`);
      }
      throw new InternalServerErrorException('Falha ao consultar detalhes do pedido PagSeguro.');
    }
  }
}