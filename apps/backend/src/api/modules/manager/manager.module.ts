import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { ManagerService } from './manager.service';
import { ManagerController } from './manager.controller';
import { SuperAdminGuard } from '../../guards/super-admin.guard';
import { SharedModule } from '../../../shared/shared.module';
import { AuthModule } from '../auth/auth.module';
import { CommandHandlers } from './commands/handlers';
import { EventHandlers } from './handlers';

/**
 * Manager Module
 *
 * Super admin panel module for user management and impersonation.
 * Requires SuperAdminGuard for all operations.
 */
@Module({
  imports: [CqrsModule, SharedModule, AuthModule],
  providers: [
    ManagerService,
    SuperAdminGuard,
    ...CommandHandlers,
    ...EventHandlers,
  ],
  controllers: [ManagerController],
  exports: [ManagerService],
})
export class ManagerModule {}
