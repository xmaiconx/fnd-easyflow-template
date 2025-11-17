import { BaseEvent } from '../../../../shared/base';

export interface EmailConfirmedEventData {
  userId: string;
  userEmail: string;
  userFullName: string;
  accountId: string;
}

export class EmailConfirmedEvent extends BaseEvent {
  constructor(aggregateId: string, data: EmailConfirmedEventData) {
    super('EmailConfirmedEvent', aggregateId, data);
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

  get accountId(): string {
    return this.data.accountId;
  }
}