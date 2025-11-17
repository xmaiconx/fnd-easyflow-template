import { Injectable, OnModuleInit, Inject } from '@nestjs/common';
import { IJobQueue, ILoggerService } from '@agentics/backend';
import { QUEUE_COMMANDS } from '@agentics/backend';
import { CreateAuditLogCommand } from '../../shared/messaging';
import { IAuditLogRepository } from '@agentics/database';

@Injectable()
export class AuditProcessor implements OnModuleInit {
  constructor(
    @Inject('IJobQueue') private readonly jobQueue: IJobQueue,
    @Inject('IAuditLogRepository') private readonly auditLogRepository: IAuditLogRepository,
    @Inject('ILoggerService') private readonly logger: ILoggerService,
  ) {}

  async onModuleInit() {
    this.logger.info('Initializing Audit Processor', {
      operation: 'audit.processor.init',
      module: 'AuditProcessor',
    });

    await this.jobQueue.process(QUEUE_COMMANDS.AUDIT_LOG, this.processAuditLog.bind(this));
  }

  private async processAuditLog(job: any) {
    try {
      const command = job.data as CreateAuditLogCommand;

      this.logger.debug('Processing audit log', {
        operation: 'audit.processor.processing',
        module: 'AuditProcessor',
        eventName: command.dto.eventName,
        workspaceId: command.dto.workspaceId,
      });

      await this.auditLogRepository.create(command.dto);

      this.logger.info('Audit log created successfully', {
        operation: 'audit.processor.success',
        module: 'AuditProcessor',
        eventName: command.dto.eventName,
        workspaceId: command.dto.workspaceId || undefined,
        accountId: command.dto.accountId || undefined,
      });
    } catch (error) {
      this.logger.error('Failed to create audit log', error as Error, {
        operation: 'audit.processor.error',
        module: 'AuditProcessor',
        errorObject: error,
      });
      throw error; // BullMQ will retry
    }
  }
}
