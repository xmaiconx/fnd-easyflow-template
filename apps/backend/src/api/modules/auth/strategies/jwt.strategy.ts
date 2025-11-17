import { Injectable, UnauthorizedException, Inject } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { IUserRepository } from '@agentics/database';
import { IConfigurationService } from '@agentics/backend';
import { RoleElevationService } from '../services/role-elevation.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    @Inject('IUserRepository') private readonly userRepository: IUserRepository,
    @Inject('IConfigurationService') configurationService: IConfigurationService,
    private readonly roleElevationService: RoleElevationService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configurationService.getJwtSecret(),
    });
  }

  async validate(payload: { userId: string; accountId: string; email: string }) {
    let user = await this.userRepository.findById(payload.userId);

    if (!user || !user.emailVerified) {
      throw new UnauthorizedException();
    }

    // Verificar e elevar usuário para super-admin se necessário
    user = await this.roleElevationService.checkAndElevateUser(user);

    return {
      userId: user.id,
      accountId: user.accountId,
      email: user.email,
      role: user.role,
    };
  }
}