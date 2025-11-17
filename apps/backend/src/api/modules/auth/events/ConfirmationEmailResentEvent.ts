import { BaseEvent } from '../../../../shared/base';

export interface ConfirmationEmailResentEventData {
  userId: string;
  userEmail: string;
  userFullName: string;
  emailVerificationToken: string;
  wasTokenRenewed: boolean;
}

export class ConfirmationEmailResentEvent extends BaseEvent {
  constructor(aggregateId: string, data: ConfirmationEmailResentEventData) {
    super('ConfirmationEmailResentEvent', aggregateId, data);
  }

  get userId(): string {
    return this.data.userId;
  }

  get userEmail(): string {
    return this.data.userEmail;
  }

  get userFullName(): string {
    return this.data.userFullName;
  }

  get emailVerificationToken(): string {
    return this.data.emailVerificationToken;
  }

  get wasTokenRenewed(): boolean {
    return this.data.wasTokenRenewed;
  }
}