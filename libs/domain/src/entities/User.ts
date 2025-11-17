import { EntityStatus } from '../enums/EntityStatus';
import { UserRole } from '../enums/UserRole';

export interface User {
  id: string;
  accountId: string;
  fullName: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  emailVerified: boolean;
  emailVerificationToken: string | null;
  emailVerificationTokenExpiry: Date | null;
  status: EntityStatus;
  createdAt: Date;
  updatedAt: Date;
}