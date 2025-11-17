import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IConfigurationService, IFeatureFlags } from '@agentics/backend';

@Injectable()
export class ConfigurationService implements IConfigurationService {
  constructor(private readonly configService: ConfigService) {}

  getFrontendUrl(): string {
    return this.configService.get<string>('FRONTEND_URL') || 'http://localhost:3000';
  }

  getJwtSecret(): string {
    return this.configService.get<string>('JWT_SECRET') || 'rugido-digital-secret-key';
  }

  getResendApiKey(): string {
    const apiKey = this.configService.get<string>('RESEND_API_KEY');
    if (!apiKey) {
      throw new Error('RESEND_API_KEY is required');
    }
    return apiKey;
  }

  getResendFromEmail(): string {
    return this.configService.get<string>('RESEND_FROM_EMAIL') || 'noreply@rugidodigital.com.br';
  }

  getRedisJobsUrl(): string {
    return this.configService.get<string>('REDIS_JOBS_URL') || 'redis://localhost:6379';
  }

  getApiPort(): number {
    const port = this.configService.get<string>('API_PORT');
    return port ? parseInt(port, 10) : 3001;
  }

  getSuperAdminEmail(): string | undefined {
    const email = this.configService.get<string>('SUPER_ADMIN_EMAIL');
    return email && email.trim() !== '' ? email.trim() : undefined;
  }

  isSuperAdminEmail(email: string): boolean {
    const superAdminEmail = this.getSuperAdminEmail();
    if (!superAdminEmail) return false;
    return email.toLowerCase().trim() === superAdminEmail.toLowerCase().trim();
  }

  getFeatureFlags(): IFeatureFlags {
    const parseBoolean = (value: string | undefined, defaultValue: boolean = true): boolean => {
      if (value === undefined || value === '') return defaultValue;
      return value.toLowerCase() === 'true' || value === '1';
    };

    return {
      workspaceEnabled: parseBoolean(
        this.configService.get<string>('FEATURES_WORKSPACE_ENABLED'),
        true
      ),
      workspaceSwitchingEnabled: parseBoolean(
        this.configService.get<string>('FEATURES_WORKSPACE_SWITCHING_ENABLED'),
        true
      ),
    };
  }
}