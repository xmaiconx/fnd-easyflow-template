import { ICommand } from '@agentics/backend';

export class ConfirmEmailCommand implements ICommand {
  public readonly type = 'ConfirmEmailCommand';

  constructor(
    public readonly token: string
  ) {}
}