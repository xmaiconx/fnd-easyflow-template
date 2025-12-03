import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, BadRequestException } from '@nestjs/common';
import { SignUpCommand } from '../SignUpCommand';
import { AccountCreatedEvent } from '../../events/AccountCreatedEvent';
import { EntityStatus, UserRole, OnboardingStatus } from '@agentics/domain';
import { IUserRepository, IAccountRepository, IWorkspaceRepository, IWorkspaceUserRepository } from '@agentics/database';
import { ILoggerService, IEventBroker, IConfigurationService } from '@agentics/backend';
import * as bcrypt from 'bcrypt';
import { randomBytes } from 'crypto';

@CommandHandler(SignUpCommand)
export class SignUpCommandHandler implements ICommandHandler<SignUpCommand> {
  constructor(
    @Inject('IUserRepository') private readonly userRepository: IUserRepository,
    @Inject('IAccountRepository') private readonly accountRepository: IAccountRepository,
    @Inject('IWorkspaceRepository') private readonly workspaceRepository: IWorkspaceRepository,
    @Inject('IWorkspaceUserRepository') private readonly workspaceUserRepository: IWorkspaceUserRepository,
    @Inject('IEventBroker') private readonly eventBroker: IEventBroker,
    @Inject('ILoggerService') private readonly logger: ILoggerService,
    @Inject('IConfigurationService') private readonly configService: IConfigurationService,
  ) {}

  async execute(command: SignUpCommand): Promise<{ userId: string }> {
    const { fullName, email, password } = command;

    this.logger.info('Starting user signup process', {
      operation: 'auth.signup.start',
      module: 'SignUpCommandHandler',
      email,
    });

    const existingUser = await this.userRepository.findByEmail(email);
    if (existingUser) {
      this.logger.warn('Signup attempt with existing email', {
        operation: 'auth.signup.email_exists',
        module: 'SignUpCommandHandler',
        email,
      });
      throw new BadRequestException('Email já está em uso');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const emailVerificationToken = randomBytes(32).toString('hex');
    const emailVerificationTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 horas

    const account = await this.accountRepository.create({
      name: `Clínica de ${fullName}`,
    });

    // Create default workspace
    const workspace = await this.workspaceRepository.create({
      accountId: account.id,
      name: `Meu Consultório`,
      status: EntityStatus.ACTIVE,
      onboardingStatus: OnboardingStatus.PENDING,
    });

    this.logger.info('Default workspace created', {
      operation: 'auth.signup.workspace_created',
      module: 'SignUpCommandHandler',
      workspaceId: workspace.id,
      accountId: account.id,
    });

    // Determinar role baseado no email configurado como super-admin
    const isSuperAdmin = this.configService.isSuperAdminEmail(email);
    const userRole = isSuperAdmin ? UserRole.SUPER_ADMIN : UserRole.OWNER;

    if (isSuperAdmin) {
      this.logger.info('Creating SUPER_ADMIN user', {
        operation: 'auth.signup.super_admin',
        module: 'SignUpCommandHandler',
        email,
      });
    }

    const user = await this.userRepository.create({
      accountId: account.id,
      fullName,
      email,
      passwordHash: hashedPassword,
      role: userRole,
      status: EntityStatus.ACTIVE,
      emailVerified: false,
      emailVerificationToken,
      emailVerificationTokenExpiry,
    });

    // Add user to workspace as owner
    await this.workspaceUserRepository.addUserToWorkspace({
      workspaceId: workspace.id,
      userId: user.id,
      role: UserRole.OWNER,
    });

    this.logger.info('User added to workspace as owner', {
      operation: 'auth.signup.user_added_to_workspace',
      module: 'SignUpCommandHandler',
      userId: user.id,
      workspaceId: workspace.id,
    });

    const event = new AccountCreatedEvent(account.id, {
      accountId: account.id,
      workspaceId: workspace.id,
      userId: user.id,
      userFullName: fullName,
      userEmail: email,
      emailVerificationToken,
    });

    await this.eventBroker.publish(event);

    this.logger.info('User signup completed successfully', {
      operation: 'auth.signup.success',
      module: 'SignUpCommandHandler',
      userId: user.id,
      accountId: account.id,
      email,
    });

    return { userId: user.id };
  }
}