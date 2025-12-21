import { ImpersonateCommandHandler } from './ImpersonateCommandHandler';
import { EndImpersonateCommandHandler } from './EndImpersonateCommandHandler';
import { UpdateUserStatusCommandHandler } from './UpdateUserStatusCommandHandler';

export const CommandHandlers = [
  ImpersonateCommandHandler,
  EndImpersonateCommandHandler,
  UpdateUserStatusCommandHandler,
];
