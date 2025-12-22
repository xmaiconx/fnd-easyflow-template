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
  DateRangeQueryDto,
  OverviewMetricsDto,
  MrrArrMetricsDto,
  RevenueMetricsDto,
  ChurnMetricsDto,
  GrowthMetricsDto,
  RetentionMetricsDto,
  AtRiskMetricsDto,
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

  /**
   * GET /api/v1/manager/metrics/overview
   * Get overview metrics with KPIs and charts
   */
  @Get('metrics/overview')
  async getOverviewMetrics(@Query() query: DateRangeQueryDto): Promise<OverviewMetricsDto> {
    return this.managerService.getOverviewMetrics(query.startDate, query.endDate);
  }

  /**
   * GET /api/v1/manager/metrics/financial/mrr-arr
   * Get MRR/ARR metrics
   */
  @Get('metrics/financial/mrr-arr')
  async getMrrArrMetrics(@Query() query: DateRangeQueryDto): Promise<MrrArrMetricsDto> {
    return this.managerService.getMrrArrMetrics(query.startDate, query.endDate);
  }

  /**
   * GET /api/v1/manager/metrics/financial/revenue
   * Get revenue metrics
   */
  @Get('metrics/financial/revenue')
  async getRevenueMetrics(@Query() query: DateRangeQueryDto): Promise<RevenueMetricsDto> {
    return this.managerService.getRevenueMetrics(query.startDate, query.endDate);
  }

  /**
   * GET /api/v1/manager/metrics/financial/churn
   * Get churn metrics
   */
  @Get('metrics/financial/churn')
  async getChurnMetrics(@Query() query: DateRangeQueryDto): Promise<ChurnMetricsDto> {
    return this.managerService.getChurnMetrics(query.startDate, query.endDate);
  }

  /**
   * GET /api/v1/manager/metrics/customers/growth
   * Get customer growth metrics
   */
  @Get('metrics/customers/growth')
  async getGrowthMetrics(@Query() query: DateRangeQueryDto): Promise<GrowthMetricsDto> {
    return this.managerService.getGrowthMetrics(query.startDate, query.endDate);
  }

  /**
   * GET /api/v1/manager/metrics/customers/retention
   * Get customer retention metrics
   */
  @Get('metrics/customers/retention')
  async getRetentionMetrics(@Query() query: DateRangeQueryDto): Promise<RetentionMetricsDto> {
    return this.managerService.getRetentionMetrics(query.startDate, query.endDate);
  }

  /**
   * GET /api/v1/manager/metrics/customers/at-risk
   * Get at-risk accounts
   */
  @Get('metrics/customers/at-risk')
  async getAtRiskAccounts(@Query() query: DateRangeQueryDto): Promise<AtRiskMetricsDto> {
    return this.managerService.getAtRiskAccounts(query.startDate, query.endDate);
  }
}
