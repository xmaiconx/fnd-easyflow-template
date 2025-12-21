/**
 * Auth Module DTOs - Frontend Types
 * Mirrored from backend auth module
 */

export interface SignUpDto {
  name: string;
  email: string;
  password: string;
  workspaceName: string;
}

export interface SignInDto {
  email: string;
  password: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: UserProfile;
}

export interface SignUpResponse {
  message: string;
  user: {
    id: string;
    email: string;
    fullName: string;
  };
}

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  emailVerified: boolean;
  accountId: string;
}

export interface RefreshTokenDto {
  refreshToken: string;
}

export interface ForgotPasswordDto {
  email: string;
}

export interface ResetPasswordDto {
  token: string;
  newPassword: string;
}

export interface VerifyEmailDto {
  token: string;
}

export interface Session {
  id: string;
  deviceName?: string;
  ipAddress: string;
  lastActivityAt: string;
  createdAt: string;
}

export interface ImpersonateDto {
  targetUserId: string;
}

export interface ImpersonateData {
  adminUserId: string;
  targetUserId: string;
  expiresAt: string;
}

export interface ConfirmEmailDto {
  token: string;
}

export interface ResendVerificationDto {
  email: string;
}

export interface UserResponseDto {
  id: string;
  accountId: string;
  fullName: string;
  email: string;
  role: string;
  emailVerified: boolean;
  status: 'active' | 'inactive' | 'suspended';
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateUserDto {
  accountId: string;
  fullName: string;
  email: string;
  password: string;
  role?: string;
}

export interface CreateAccountDto {
  name: string;
  gatewayCustomerId?: string;
  settings?: object;
}

export interface UpdateAccountDto {
  name?: string;
  gatewayCustomerId?: string;
  settings?: object;
}
