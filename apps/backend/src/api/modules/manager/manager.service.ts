import { Injectable, Inject } from '@nestjs/common';
import { Kysely } from 'kysely';
import { Database } from '@fnd/database';
import { ListUsersDto, UserListItemDto, UserDetailsDto, MetricsDto } from './dtos';
import { ILoggerService } from '@fnd/backend';

/**
 * Manager Service
 *
 * Provides read-only operations for super admin panel.
 * All queries use raw Kysely for flexible querying.
 */
@Injectable()
export class ManagerService {
  constructor(
    @Inject('DATABASE') private readonly db: Kysely<Database>,
    @Inject('IUserRepository') private readonly userRepository: any,
    @Inject('IWorkspaceUserRepository') private readonly workspaceUserRepository: any,
    @Inject('ISessionRepository') private readonly sessionRepository: any,
    @Inject('ILoggerService') private readonly logger: ILoggerService,
  ) {}

  /**
   * Get users with search and filters
   */
  async getUsers(filters: ListUsersDto): Promise<UserListItemDto[]> {
    const { search, status, page = 1, limit = 50 } = filters;
    const offset = (page - 1) * limit;

    this.logger.info('Fetching users list', {
      operation: 'manager.get_users',
      module: 'ManagerService',
      filters,
    });

    let query = this.db
      .selectFrom('users')
      .leftJoin('sessions', (join) =>
        join
          .onRef('sessions.user_id', '=', 'users.id')
          .on('sessions.revoked_at', 'is', null)
      )
      .select([
        'users.id',
        'users.email',
        'users.full_name as name',
        'users.status',
        'users.email_verified',
        'users.created_at',
        this.db.fn.max('sessions.last_activity_at').as('lastLoginAt'),
      ])
      .groupBy([
        'users.id',
        'users.email',
        'users.full_name',
        'users.status',
        'users.email_verified',
        'users.created_at',
      ]);

    // Apply search filter
    if (search) {
      query = query.where((eb) =>
        eb.or([
          eb('users.email', 'ilike', `%${search}%`),
          eb('users.full_name', 'ilike', `%${search}%`),
        ])
      );
    }

    // Apply status filter
    if (status) {
      query = query.where('users.status', '=', status);
    }

    // Apply pagination
    const results = await query
      .orderBy('users.created_at', 'desc')
      .limit(limit)
      .offset(offset)
      .execute();

    return results.map((row) => ({
      id: row.id,
      email: row.email,
      name: row.name,
      status: row.status as any,
      emailVerified: row.email_verified,
      createdAt: row.created_at,
      lastLoginAt: row.lastLoginAt || null,
    }));
  }

  /**
   * Get detailed user information
   */
  async getUserDetails(userId: string): Promise<UserDetailsDto> {
    this.logger.info('Fetching user details', {
      operation: 'manager.get_user_details',
      module: 'ManagerService',
      userId,
    });

    // Get user
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new Error(`User not found: ${userId}`);
    }

    // Get workspaces
    const workspaceUsers = await this.db
      .selectFrom('workspace_users')
      .innerJoin('workspaces', 'workspaces.id', 'workspace_users.workspace_id')
      .select([
        'workspaces.id',
        'workspaces.name',
        'workspace_users.role',
      ])
      .where('workspace_users.user_id', '=', userId)
      .execute();

    // Get active sessions count
    const activeSessionsResult = await this.db
      .selectFrom('sessions')
      .select((eb) => eb.fn.countAll().as('count'))
      .where('user_id', '=', userId)
      .where('revoked_at', 'is', null)
      .where('expires_at', '>', new Date())
      .executeTakeFirst();

    const activeSessions = Number(activeSessionsResult?.count || 0);

    return {
      id: user.id,
      email: user.email,
      name: user.fullName,
      status: user.status,
      emailVerified: user.emailVerified,
      createdAt: user.createdAt,
      accountId: user.accountId,
      workspaces: workspaceUsers.map((wu) => ({
        id: wu.id,
        name: wu.name,
        role: wu.role,
      })),
      activeSessions,
    };
  }

  /**
   * Get basic auth metrics
   */
  async getMetrics(): Promise<MetricsDto> {
    this.logger.info('Fetching auth metrics', {
      operation: 'manager.get_metrics',
      module: 'ManagerService',
    });

    // Total users
    const totalUsersResult = await this.db
      .selectFrom('users')
      .select((eb) => eb.fn.countAll().as('count'))
      .executeTakeFirst();
    const totalUsers = Number(totalUsersResult?.count || 0);

    // Active users
    const activeUsersResult = await this.db
      .selectFrom('users')
      .select((eb) => eb.fn.countAll().as('count'))
      .where('status', '=', 'active')
      .executeTakeFirst();
    const activeUsers = Number(activeUsersResult?.count || 0);

    // Locked accounts (inactive status)
    const lockedAccountsResult = await this.db
      .selectFrom('users')
      .select((eb) => eb.fn.countAll().as('count'))
      .where('status', '=', 'inactive')
      .executeTakeFirst();
    const lockedAccounts = Number(lockedAccountsResult?.count || 0);

    // Recent signups (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentSignupsResult = await this.db
      .selectFrom('users')
      .select((eb) => eb.fn.countAll().as('count'))
      .where('created_at', '>=', sevenDaysAgo)
      .executeTakeFirst();
    const recentSignups = Number(recentSignupsResult?.count || 0);

    // Recent logins (last 24 hours)
    const twentyFourHoursAgo = new Date();
    twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);

    const recentLoginsResult = await this.db
      .selectFrom('sessions')
      .select((eb) => eb.fn.countAll().as('count'))
      .where('last_activity_at', '>=', twentyFourHoursAgo)
      .where('revoked_at', 'is', null)
      .executeTakeFirst();
    const recentLogins = Number(recentLoginsResult?.count || 0);

    return {
      totalUsers,
      activeUsers,
      lockedAccounts,
      recentSignups,
      recentLogins,
    };
  }
}
