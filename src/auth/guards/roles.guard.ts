import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Roles } from '../decorators/roles.decorator';
import authErrors from '../auth.constants';
import { GqlExecutionContext } from '@nestjs/graphql';

function matchRoles(userRole: string, requiredRoles: string[]): boolean {
  return requiredRoles.some((role) => userRole === role);
}

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const roles = this.reflector.get(Roles, context.getHandler());
    console.log({ roles });
    if (!roles) {
      return true;
    }

    const ctx = GqlExecutionContext.create(context);
    const user = ctx.getContext().req.user;
    console.log({ userRole: user.role });

    const isAllowed = matchRoles(user.role, roles);

    if (!isAllowed) {
      throw new UnauthorizedException(authErrors.ROLE_MISMATCH);
    }

    return true;
  }
}
