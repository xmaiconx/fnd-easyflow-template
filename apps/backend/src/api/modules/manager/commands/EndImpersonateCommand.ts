import { ICommand } from '@fnd/backend';

/**
 * EndImpersonateCommand
 *
 * Ends an active impersonation session.
 */
export class EndImpersonateCommand implements ICommand {
  public readonly type = 'EndImpersonateCommand';

  constructor(
    public readonly impersonateSessionId: string,
  ) {}
}
