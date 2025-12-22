import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { JwtAuthGuard } from './jwt-auth.guard';
import { UserRole } from '@fnd/domain';

/**
 * Account Admin Guard
 *
 * Extends JwtAuthGuard to require account admin access (Owner or Admin).
 *
 * Flow:
 * 1. Delegates to JwtAuthGuard for JWT validation
 * 2. Checks if authenticated user role is OWNER or ADMIN
 * 3. Rejects SUPER_ADMIN (account admins are account-scoped only)
 * 4. Throws ForbiddenException if not authorized
 *
 * Usage: @UseGuards(AccountAdminGuard)
 */
@Injectable()
export class AccountAdminGuard extends JwtAuthGuard implements CanActivate {
  constructor() {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // First, validate JWT and inject user into request
    const isAuthenticated = await super.canActivate(context);

    if (!isAuthenticated) {
      return false;
    }

    // Then, check account admin access based on user role
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user || !user.role) {
      throw new ForbiddenException('User context not found');
    }

    // Only OWNER and ADMIN are allowed (reject SUPER_ADMIN and MEMBER)
    if (user.role !== UserRole.OWNER && user.role !== UserRole.ADMIN) {
      throw new ForbiddenException('Account admin access required (Owner or Admin only)');
    }

    return true;
  }
}
