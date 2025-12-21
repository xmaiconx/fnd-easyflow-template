import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Inject,
} from '@nestjs/common';
import { JwtAuthGuard } from './jwt-auth.guard';
import { IConfigurationService } from '@fnd/backend';

/**
 * Super Admin Guard
 *
 * Extends JwtAuthGuard to require super admin access.
 *
 * Flow:
 * 1. Delegates to JwtAuthGuard for JWT validation
 * 2. Checks if authenticated user email matches SUPER_ADMIN_EMAIL
 * 3. Throws ForbiddenException if not super admin
 *
 * Usage: @UseGuards(SuperAdminGuard)
 */
@Injectable()
export class SuperAdminGuard extends JwtAuthGuard implements CanActivate {
  constructor(
    @Inject('IConfigurationService') private readonly configService: IConfigurationService,
  ) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // First, validate JWT and inject user into request
    const isAuthenticated = await super.canActivate(context);

    if (!isAuthenticated) {
      return false;
    }

    // Then, check super admin access
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user || !user.email) {
      throw new ForbiddenException('User context not found');
    }

    const superAdminEmail = this.configService.getSuperAdminEmail();

    if (!superAdminEmail) {
      throw new ForbiddenException('Super admin feature is not configured');
    }

    if (user.email.toLowerCase().trim() !== superAdminEmail.toLowerCase().trim()) {
      throw new ForbiddenException('Super admin access required');
    }

    return true;
  }
}
