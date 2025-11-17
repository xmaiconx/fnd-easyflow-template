import { ICommand } from '@agentics/backend';

export class ResendConfirmationCommand implements ICommand {
  public readonly type = 'ResendConfirmationCommand';

  constructor(
    public readonly email: string
  ) {}
}