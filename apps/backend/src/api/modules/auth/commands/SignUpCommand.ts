import { ICommand } from '@agentics/backend';

export class SignUpCommand implements ICommand {
  public readonly type = 'SignUpCommand';

  constructor(
    public readonly fullName: string,
    public readonly email: string,
    public readonly password: string
  ) {}
}