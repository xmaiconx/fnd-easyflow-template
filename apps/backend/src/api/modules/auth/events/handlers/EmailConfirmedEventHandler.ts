import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { EmailConfirmedEvent } from '../EmailConfirmedEvent';
import { IEmailQueueService } from '@agentics/backend';
import { ILoggerService } from '@agentics/backend';

@EventsHandler(EmailConfirmedEvent)
export class EmailConfirmedEventHandler implements IEventHandler<EmailConfirmedEvent> {
  constructor(
    @Inject('IEmailQueueService') private readonly emailQueueService: IEmailQueueService,
    @Inject('ILoggerService') private readonly logger: ILoggerService,
  ) {}

  async handle(event: EmailConfirmedEvent): Promise<void> {
    this.logger.info('Processing EmailConfirmedEvent', {
      operation: 'auth.email_confirmed.start',
      module: 'EmailConfirmedEventHandler',
      userId: event.userId,
      email: event.userEmail,
    });

    try {
      await this.emailQueueService.sendEmailTemplateAsync({
        to: event.userEmail,
        templateId: 'welcome',
        variables: {
          name: event.userFullName,
        },
      });

      this.logger.info('Welcome email queued successfully', {
        operation: 'auth.email_confirmed.welcome_queued',
        module: 'EmailConfirmedEventHandler',
        userId: event.userId,
        email: event.userEmail,
      });
    } catch (error) {
      this.logger.error('Failed to queue welcome email', error instanceof Error ? error : new Error(String(error)), {
        operation: 'auth.email_confirmed.welcome_failed',
        module: 'EmailConfirmedEventHandler',
        userId: event.userId,
        email: event.userEmail,
      });
      throw error;
    }
  }
}