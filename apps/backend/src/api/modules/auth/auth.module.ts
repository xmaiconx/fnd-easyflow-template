import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { SharedModule } from '../../../shared/shared.module';
import { IConfigurationService } from '@agentics/backend';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { RoleElevationService } from './services/role-elevation.service';
import { SignUpCommandHandler, ConfirmEmailCommandHandler, ResendConfirmationCommandHandler } from './commands';
import { AccountCreatedEventHandler, EmailConfirmedEventHandler, ConfirmationEmailResentEventHandler } from './events';

@Module({
  imports: [
    CqrsModule,
    SharedModule,
    PassportModule,
    JwtModule.registerAsync({
      imports: [SharedModule],
      useFactory: async (configurationService: IConfigurationService) => ({
        secret: configurationService.getJwtSecret(),
        signOptions: { expiresIn: '7d' },
      }),
      inject: ['IConfigurationService'],
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtStrategy,
    RoleElevationService,
    SignUpCommandHandler,
    ConfirmEmailCommandHandler,
    ResendConfirmationCommandHandler,
    AccountCreatedEventHandler,
    EmailConfirmedEventHandler,
    ConfirmationEmailResentEventHandler,
  ],
  exports: [AuthService],
})
export class AuthModule {}