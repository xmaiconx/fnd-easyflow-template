import { ICommand, ICommandHandler, IConfigurationService } from '@fnd/backend';
import { CommandHandler } from '@nestjs/cqrs';
import { EventBus } from '@nestjs/cqrs';
import { Inject, ConflictException } from '@nestjs/common';
import { EntityStatus, UserRole, OnboardingStatus } from '@fnd/domain';
import {
  UserRepository,
  AccountRepository,
  WorkspaceRepository,
  WorkspaceUserRepository,
  AuthTokenRepository,
} from '@fnd/database';
import { PasswordService } from '../services/password.service';
import { AccountCreatedEvent } from '../events/AccountCreatedEvent';

export class SignUpCommand {
  constructor(
    public readonly email: string,
    public readonly password: string,
    public readonly fullName: string,
    public readonly workspaceName: string | undefined,
    public readonly ipAddress: string,
    public readonly userAgent: string,
  ) {}
}

@CommandHandler(SignUpCommand)
export class SignUpCommandHandler implements ICommandHandler<any> {
  constructor(
    @Inject('IUserRepository')
    private readonly userRepository: UserRepository,
    @Inject('IAccountRepository')
    private readonly accountRepository: AccountRepository,
    @Inject('IWorkspaceRepository')
    private readonly workspaceRepository: WorkspaceRepository,
    @Inject('IWorkspaceUserRepository')
    private readonly workspaceUserRepository: WorkspaceUserRepository,
    @Inject('IAuthTokenRepository')
    private readonly authTokenRepository: AuthTokenRepository,
    @Inject('IConfigurationService')
    private readonly configService: IConfigurationService,
    private readonly passwordService: PasswordService,
    private readonly eventBus: EventBus,
  ) {}

  async execute(command: SignUpCommand): Promise<{
    message: string;
    user: {
      id: string;
      email: string;
      fullName: string;
    };
  }> {
    // Check if user already exists
    const existingUser = await this.userRepository.findByEmail(command.email);
    if (existingUser) {
      throw new ConflictException('User already exists');
    }

    // Hash password
    const passwordHash = await this.passwordService.hashPassword(command.password);

    // Create account
    const account = await this.accountRepository.create({
      name: `${command.fullName}'s Account`,
      settings: {},
    });

    // Determine user role based on super admin email
    const isSuperAdmin = this.configService.isSuperAdminEmail(command.email);
    const userRole = isSuperAdmin ? UserRole.SUPER_ADMIN : UserRole.OWNER;

    // Create user
    const user = await this.userRepository.create({
      accountId: account.id,
      fullName: command.fullName,
      email: command.email,
      passwordHash,
      emailVerified: false,
      role: userRole,
      status: EntityStatus.ACTIVE,
    });

    // Create workspace with default name if not provided
    const workspace = await this.workspaceRepository.create({
      accountId: account.id,
      name: command.workspaceName || 'Workspace 01',
      settings: {},
      status: EntityStatus.ACTIVE,
      onboardingStatus: OnboardingStatus.PENDING,
    });

    // Generate verification token
    const verificationToken = this.passwordService.generateRandomToken();
    const tokenHash = this.passwordService.hashToken(verificationToken);

    // Store verification token
    await this.authTokenRepository.create({
      userId: user.id,
      type: 'email_verification',
      tokenHash,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
      usedAt: null,
    });

    // Emit AccountCreatedEvent (sends verification email)
    this.eventBus.publish(
      new AccountCreatedEvent(user.id, {
        userId: user.id,
        email: user.email,
        verificationToken,
      })
    );

    // Return success message without tokens
    // User must verify email before logging in
    return {
      message: 'Account created successfully. Please check your email to verify your account.',
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
      },
    };
  }
}
