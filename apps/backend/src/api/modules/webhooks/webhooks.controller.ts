import {
  Controller,
  Post,
  Param,
  Body,
  HttpCode,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import { WebhooksService } from './webhooks.service';

/**
 * Controller para receber webhooks externos
 * Rota: POST /api/v1/gateway/:uuid
 */
@Controller('gateway')
export class WebhooksController {
  constructor(private readonly webhooksService: WebhooksService) {}

  /**
   * Recebe webhook via UUID do gateway
   * @param uuid - UUID codificado contendo configuração do gateway
   * @param payload - Payload bruto do webhook (body da requisição)
   * @returns ID do webhook event criado e status de sucesso
   */
  @Post(':uuid')
  @HttpCode(HttpStatus.OK)
  async receiveWebhook(
    @Param('uuid') uuid: string,
    @Body() payload: unknown
  ): Promise<{ success: boolean; webhookEventId: string; message: string }> {
    if (!uuid) {
      throw new BadRequestException('UUID is required in the URL path');
    }

    if (!payload || (typeof payload === 'object' && Object.keys(payload).length === 0)) {
      throw new BadRequestException('Request body cannot be empty');
    }

    const webhookEventId = await this.webhooksService.receiveWebhook(uuid, payload);

    return {
      success: true,
      webhookEventId,
      message: 'Webhook received and queued for processing',
    };
  }
}
