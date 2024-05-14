import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import authErrors from '~/auth/const/auth.errors';
import { User } from '~/users/user.entity';

export function matchRoles(userRole: string, requiredRoles: string[]): boolean {
  return requiredRoles.some((role) => userRole === role);
}

@Injectable()
export abstract class BaseAssociateGuard implements CanActivate {
  constructor() {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const ctx = GqlExecutionContext.create(context);
    const user = ctx.getContext().req.user as User;
    const { id, projectId, ticketId } = ctx.getArgs();

    const entityId = ticketId || projectId || id;

    if (!(await this.validate(ctx, entityId, user))) {
      throw new ForbiddenException(authErrors.FORBIDDEN_RESOURCE);
    }
    return true;
  }

  abstract validate(
    ctx: GqlExecutionContext,
    entityId: string,
    user: User,
  ): Promise<boolean>;
}
