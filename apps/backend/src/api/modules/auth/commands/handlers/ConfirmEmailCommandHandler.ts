import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, BadRequestException } from '@nestjs/common';
import { ConfirmEmailCommand } from '../ConfirmEmailCommand';
import { EmailConfirmedEvent } from '../../events/EmailConfirmedEvent';
import { IUserRepository } from '@agentics/database';
import { ILoggerService, IEventBroker } from '@agentics/backend';

@CommandHandler(ConfirmEmailCommand)
export class ConfirmEmailCommandHandler implements ICommandHandler<ConfirmEmailCommand> {
  constructor(
    @Inject('IUserRepository') private readonly userRepository: IUserRepository,
    @Inject('IEventBroker') private readonly eventBroker: IEventBroker,
    @Inject('ILoggerService') private readonly logger: ILoggerService,
  ) {}

  async execute(command: ConfirmEmailCommand): Promise<void> {
    const { token } = command;

    this.logger.info('Starting email confirmation process', {
      operation: 'auth.confirm_email.start',
      module: 'ConfirmEmailCommandHandler',
    });

    const user = await this.userRepository.findByEmailVerificationToken(token);
    if (!user) {
      this.logger.warn('Email confirmation with invalid token', {
        operation: 'auth.confirm_email.invalid_token',
        module: 'ConfirmEmailCommandHandler',
      });
      throw new BadRequestException('Token de confirmação inválido ou expirado');
    }

    // Verificar se o token expirou (24 horas)
    if (user.emailVerificationTokenExpiry && new Date() > user.emailVerificationTokenExpiry) {
      this.logger.warn('Email confirmation with expired token', {
        operation: 'auth.confirm_email.token_expired',
        module: 'ConfirmEmailCommandHandler',
        userId: user.id,
        email: user.email,
        expiry: user.emailVerificationTokenExpiry,
      });
      throw new BadRequestException('Token de confirmação expirado. Solicite um novo email de confirmação.');
    }

    // Verificar se o email já foi confirmado
    if (user.emailVerified) {
      this.logger.warn('Email confirmation for already verified user', {
        operation: 'auth.confirm_email.already_verified',
        module: 'ConfirmEmailCommandHandler',
        userId: user.id,
        email: user.email,
      });
      throw new BadRequestException('Email já foi confirmado anteriormente');
    }

    // Atualizar usuário como verificado
    await this.userRepository.update(user.id, {
      emailVerified: true,
      emailVerificationToken: null,
      emailVerificationTokenExpiry: null,
    });

    // Publicar evento de email confirmado
    const event = new EmailConfirmedEvent(user.id, {
      userId: user.id,
      userEmail: user.email,
      userFullName: user.fullName,
      accountId: user.accountId,
    });

    await this.eventBroker.publish(event);

    this.logger.info('Email confirmation completed successfully', {
      operation: 'auth.confirm_email.success',
      module: 'ConfirmEmailCommandHandler',
      userId: user.id,
      accountId: user.accountId,
      email: user.email,
    });
  }
}