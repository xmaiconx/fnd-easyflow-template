import { IFeatureFlags } from '../features/IFeatureFlags';

export interface IConfigurationService {
  getFrontendUrl(): string;
  getJwtSecret(): string;
  getResendApiKey(): string;
  getResendFromEmail(): string;
  getRedisJobsUrl(): string;
  getApiPort(): number;
  getSuperAdminEmail(): string | undefined;
  isSuperAdminEmail(email: string): boolean;
  getFeatureFlags(): IFeatureFlags;

  // Stripe configuration
  getStripeSecretKey(): string;
  getStripeWebhookSecret(): string;
  getStripeSuccessUrl(): string;
  getStripeCancelUrl(): string;
}