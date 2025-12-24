import { ICommand } from '@fnd/backend';

/**
 * DeactivatePlanCommand
 *
 * Deactivate a plan (sets isActive=false).
 */
export class DeactivatePlanCommand implements ICommand {
  public readonly type = 'DeactivatePlanCommand';

  constructor(
    public readonly planId: string,
    public readonly deactivatedBy: string,
  ) {}
}
