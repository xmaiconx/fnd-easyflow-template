import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, BadRequestException } from '@nestjs/common';
import { ResendConfirmationCommand } from '../ResendConfirmationCommand';
import { ConfirmationEmailResentEvent } from '../../events/ConfirmationEmailResentEvent';
import { IUserRepository } from '@agentics/database';
import { ILoggerService, IEventBroker } from '@agentics/backend';
import { randomBytes } from 'crypto';

@CommandHandler(ResendConfirmationCommand)
export class ResendConfirmationCommandHandler implements ICommandHandler<ResendConfirmationCommand> {
  constructor(
    @Inject('IUserRepository') private readonly userRepository: IUserRepository,
    @Inject('IEventBroker') private readonly eventBroker: IEventBroker,
    @Inject('ILoggerService') private readonly logger: ILoggerService,
  ) {}

  async execute(command: ResendConfirmationCommand): Promise<void> {
    const { email } = command;

    this.logger.info('Starting resend confirmation email process', {
      operation: 'auth.resend_confirmation.start',
      module: 'ResendConfirmationCommandHandler',
      email,
    });

    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      this.logger.warn('Resend confirmation attempt with non-existent email', {
        operation: 'auth.resend_confirmation.user_not_found',
        module: 'ResendConfirmationCommandHandler',
        email,
      });
      throw new BadRequestException('Email não encontrado');
    }

    // Verificar se o email já foi confirmado
    if (user.emailVerified) {
      this.logger.warn('Resend confirmation for already verified user', {
        operation: 'auth.resend_confirmation.already_verified',
        module: 'ResendConfirmationCommandHandler',
        userId: user.id,
        email,
      });
      throw new BadRequestException('Email já foi confirmado');
    }

    let emailVerificationToken = user.emailVerificationToken;
    let wasTokenRenewed = false;

    // Se não há token ou token expirado, gerar novo
    const now = new Date();
    if (!user.emailVerificationToken ||
        !user.emailVerificationTokenExpiry ||
        now > user.emailVerificationTokenExpiry) {

      emailVerificationToken = randomBytes(32).toString('hex');
      const emailVerificationTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 horas
      wasTokenRenewed = true;

      await this.userRepository.update(user.id, {
        emailVerificationToken,
        emailVerificationTokenExpiry,
      });

      this.logger.info('Generated new verification token', {
        operation: 'auth.resend_confirmation.token_renewed',
        module: 'ResendConfirmationCommandHandler',
        userId: user.id,
        email,
      });
    } else {
      this.logger.info('Reusing existing valid token', {
        operation: 'auth.resend_confirmation.token_reused',
        module: 'ResendConfirmationCommandHandler',
        userId: user.id,
        email,
        expiresAt: user.emailVerificationTokenExpiry,
      });
    }

    // Publicar evento de reenvio
    const event = new ConfirmationEmailResentEvent(user.id, {
      userId: user.id,
      userEmail: user.email,
      userFullName: user.fullName,
      emailVerificationToken: emailVerificationToken!,
      wasTokenRenewed,
    });

    await this.eventBroker.publish(event);

    this.logger.info('Resend confirmation completed successfully', {
      operation: 'auth.resend_confirmation.success',
      module: 'ResendConfirmationCommandHandler',
      userId: user.id,
      email,
      wasTokenRenewed,
    });
  }
}