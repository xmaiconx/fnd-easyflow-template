import { BaseEvent } from '../../../../shared/base';

export interface AccountCreatedEventData {
  accountId: string;
  workspaceId: string;
  userId: string;
  userFullName: string;
  userEmail: string;
  emailVerificationToken: string;
}

export class AccountCreatedEvent extends BaseEvent {
  constructor(aggregateId: string, data: AccountCreatedEventData) {
    super('AccountCreatedEvent', aggregateId, data);
  }

  get accountId(): string {
    return this.data.accountId;
  }

  get workspaceId(): string {
    return this.data.workspaceId;
  }

  get userId(): string {
    return this.data.userId;
  }

  get userFullName(): string {
    return this.data.userFullName;
  }

  get userEmail(): string {
    return this.data.userEmail;
  }

  get emailVerificationToken(): string {
    return this.data.emailVerificationToken;
  }
}