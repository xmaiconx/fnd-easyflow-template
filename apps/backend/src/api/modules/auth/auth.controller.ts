import {
  Controller,
  Post,
  Get,
  Delete,
  Body,
  Param,
  HttpStatus,
  HttpCode,
  UseGuards,
  Request,
  Req,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { LocalAuthGuard } from '../../guards/local-auth.guard';
import { RateLimitGuard, RateLimit } from '../../guards/rate-limit.guard';
import {
  SignUpDto,
  SignInDto,
  RefreshTokenDto,
  ForgotPasswordDto,
  ResetPasswordDto,
  VerifyEmailDto,
  ResendVerificationDto,
} from './dtos';
import {
  SignUpCommand,
  SignInCommand,
  RefreshTokenCommand,
  ForgotPasswordCommand,
  ResetPasswordCommand,
  VerifyEmailCommand,
  ResendVerificationCommand,
} from './commands';
import { SessionRepository } from '@fnd/database';
import { Inject } from '@nestjs/common';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly commandBus: CommandBus,
    @Inject('ISessionRepository')
    private readonly sessionRepository: SessionRepository,
  ) {}

  @Post('signup')
  @UseGuards(RateLimitGuard)
  @RateLimit({ limit: 3, windowSeconds: 60 })
  @HttpCode(HttpStatus.CREATED)
  async signup(@Body() dto: SignUpDto, @Req() req: any) {
    const ipAddress = req.ip || req.connection?.remoteAddress || 'unknown';
    const userAgent = req.headers['user-agent'] || 'unknown';

    return this.commandBus.execute(
      new SignUpCommand(dto.email, dto.password, dto.name, dto.workspaceName, ipAddress, userAgent)
    );
  }

  @Post('signin')
  @UseGuards(LocalAuthGuard, RateLimitGuard)
  @RateLimit({ limit: 5, windowSeconds: 60 })
  @HttpCode(HttpStatus.OK)
  async signin(@Req() req: any, @Body() dto: SignInDto) {
    const ipAddress = req.ip || req.connection?.remoteAddress || 'unknown';
    const userAgent = req.headers['user-agent'] || 'unknown';

    return this.commandBus.execute(new SignInCommand(req.user, ipAddress, userAgent));
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(@Body() dto: RefreshTokenDto) {
    return this.commandBus.execute(new RefreshTokenCommand(dto.refreshToken));
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async logout(@Req() req: any) {
    // Get current session from refresh token if provided
    // For simplicity, revoke all sessions for the user
    await this.sessionRepository.revokeAllByUserId(req.user.id);
    return { message: 'Logged out successfully' };
  }

  @Post('forgot-password')
  @UseGuards(RateLimitGuard)
  @RateLimit({ limit: 3, windowSeconds: 60 })
  @HttpCode(HttpStatus.OK)
  async forgotPassword(@Body() dto: ForgotPasswordDto) {
    await this.commandBus.execute(new ForgotPasswordCommand(dto.email));
    return { message: 'If the email exists, a password reset link has been sent.' };
  }

  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  async resetPassword(@Body() dto: ResetPasswordDto) {
    await this.commandBus.execute(new ResetPasswordCommand(dto.token, dto.newPassword));
    return { message: 'Password reset successfully.' };
  }

  @Post('verify-email')
  @HttpCode(HttpStatus.OK)
  async verifyEmail(@Body() dto: VerifyEmailDto) {
    await this.commandBus.execute(new VerifyEmailCommand(dto.token));
    return { message: 'Email verified successfully.' };
  }

  @Post('resend-verification')
  @UseGuards(RateLimitGuard)
  @RateLimit({ limit: 3, windowSeconds: 60 })
  @HttpCode(HttpStatus.OK)
  async resendVerification(@Body() dto: ResendVerificationDto) {
    await this.commandBus.execute(new ResendVerificationCommand(dto.email));
    return { message: 'If the email exists and is not verified, a verification link has been sent.' };
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getMe(@Req() req: any) {
    return {
      user: {
        id: req.user.id,
        email: req.user.email,
        fullName: req.user.fullName,
        emailVerified: req.user.emailVerified,
        accountId: req.user.accountId,
        role: req.user.role,
        createdAt: req.user.createdAt,
      },
    };
  }

  @Get('sessions')
  @UseGuards(JwtAuthGuard)
  async getSessions(@Req() req: any) {
    const sessions = await this.sessionRepository.findByUserId(req.user.id);
    return {
      sessions: sessions.map((session) => ({
        id: session.id,
        deviceName: session.deviceName,
        ipAddress: session.ipAddress,
        lastActivityAt: session.lastActivityAt,
        createdAt: session.createdAt,
      })),
    };
  }

  @Delete('sessions/:id')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async revokeSession(@Req() req: any, @Param('id') sessionId: string) {
    // Verify session exists
    const session = await this.sessionRepository.findById(sessionId);
    if (!session) {
      throw new NotFoundException('Session not found');
    }

    // Verify session belongs to user before revoking
    if (session.userId !== req.user.id) {
      throw new ForbiddenException('You can only revoke your own sessions');
    }

    await this.sessionRepository.revokeById(sessionId);
    return { message: 'Session revoked successfully' };
  }
}