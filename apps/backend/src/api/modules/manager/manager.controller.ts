import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { SuperAdminGuard } from '../../guards/super-admin.guard';
import { ManagerService } from './manager.service';
import {
  ListUsersDto,
  UpdateUserStatusDto,
  ImpersonateDto,
  UserListItemDto,
  UserDetailsDto,
  ImpersonateResponseDto,
  MetricsDto,
} from './dtos';
import {
  ImpersonateCommand,
  EndImpersonateCommand,
  UpdateUserStatusCommand,
} from './commands';

/**
 * Manager Controller
 *
 * Super admin panel endpoints for user management and impersonation.
 * All endpoints require SuperAdminGuard (SUPER_ADMIN_EMAIL).
 */
@Controller('manager')
@UseGuards(SuperAdminGuard)
export class ManagerController {
  constructor(
    private readonly managerService: ManagerService,
    private readonly commandBus: CommandBus,
  ) {}

  /**
   * GET /api/v1/manager/users
   * List users with search and filters
   */
  @Get('users')
  async listUsers(@Query() filters: ListUsersDto): Promise<UserListItemDto[]> {
    return this.managerService.getUsers(filters);
  }

  /**
   * GET /api/v1/manager/users/:id
   * Get detailed user information
   */
  @Get('users/:id')
  async getUserDetails(@Param('id') id: string): Promise<UserDetailsDto> {
    return this.managerService.getUserDetails(id);
  }

  /**
   * PATCH /api/v1/manager/users/:id/status
   * Activate or deactivate user
   */
  @Patch('users/:id/status')
  @HttpCode(HttpStatus.NO_CONTENT)
  async updateUserStatus(
    @Param('id') id: string,
    @Body() dto: UpdateUserStatusDto,
    @Request() req: any,
  ): Promise<void> {
    await this.commandBus.execute(
      new UpdateUserStatusCommand(id, dto.status as any, req.user.id),
    );
  }

  /**
   * POST /api/v1/manager/impersonate
   * Start impersonation session
   */
  @Post('impersonate')
  @HttpCode(HttpStatus.OK)
  async impersonate(
    @Body() dto: ImpersonateDto,
    @Request() req: any,
  ): Promise<ImpersonateResponseDto> {
    return this.commandBus.execute(
      new ImpersonateCommand(req.user.id, dto.targetUserId, dto.reason),
    );
  }

  /**
   * DELETE /api/v1/manager/impersonate
   * End impersonation session
   * Note: Session ID should come from request context or body
   */
  @Delete('impersonate')
  @HttpCode(HttpStatus.NO_CONTENT)
  async endImpersonate(@Body() body: { sessionId: string }): Promise<void> {
    await this.commandBus.execute(new EndImpersonateCommand(body.sessionId));
  }

  /**
   * GET /api/v1/manager/metrics
   * Get basic auth metrics
   */
  @Get('metrics')
  async getMetrics(): Promise<MetricsDto> {
    return this.managerService.getMetrics();
  }
}
