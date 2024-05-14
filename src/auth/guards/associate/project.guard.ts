import { ForbiddenException, Injectable } from '@nestjs/common';
import { BaseAssociateGuard, matchRoles } from './base.guard';
import { User } from '~/users/user.entity';
import { Reflector } from '@nestjs/core';
import { GqlExecutionContext } from '@nestjs/graphql';
import { Roles } from '~/auth/decorators/roles.decorator';
import authErrors from '~/auth/const/auth.errors';
import { ProjectService } from '~/projects/project.service';

@Injectable()
export class ProjectGuard extends BaseAssociateGuard {
  constructor(
    private reflector: Reflector,
    private projectService: ProjectService,
  ) {
    super();
  }

  async validate(
    ctx: GqlExecutionContext,
    projectId: string,
    user: User,
  ): Promise<boolean> {
    const project = await this.projectService.findProjectUser(
      projectId,
      user.id,
    );

    if (!project) {
      return false;
    }

    const roles = this.reflector.get(Roles, ctx.getHandler());
    if (!roles || !roles.length) {
      return true;
    }

    if (!matchRoles(project.role, roles)) {
      throw new ForbiddenException(authErrors.ROLE_MISMATCH);
    }
    return true;
  }
}
