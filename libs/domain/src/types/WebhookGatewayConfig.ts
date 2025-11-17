import { WebhookType } from '../enums/WebhookType';

/**
 * Estrutura do UUID decodificado do gateway
 * Contém informações necessárias para identificar o contexto do webhook
 */
export interface WebhookGatewayConfig {
  accountId: string;
  projectId: string;
  webhookType: WebhookType;
  provider: string;
  channel?: string;
  implementation?: string;
}
