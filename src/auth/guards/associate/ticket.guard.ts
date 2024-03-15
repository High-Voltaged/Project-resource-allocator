import { ForbiddenException, Injectable } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { Reflector } from '@nestjs/core';
import { User } from '~/users/user.entity';
import { TicketService } from '~/tickets/ticket.service';
import { ProjectService } from '~/projects/project.service';
import authErrors from '~/auth/auth.constants';
import { Roles } from '~/auth/decorators/roles.decorator';
import { BaseAssociateGuard, matchRoles } from './base.guard';

@Injectable()
export class TicketGuard extends BaseAssociateGuard {
  constructor(
    private reflector: Reflector,
    private ticketService: TicketService,
    private projectService: ProjectService,
  ) {
    super();
  }

  async validate(
    ctx: GqlExecutionContext,
    ticketId: string,
    user: User,
  ): Promise<boolean> {
    await this.ticketService.checkIfTicketExists(ticketId);

    const { project } = await this.ticketService.findOneById(ticketId, {
      relations: ['project'],
    });

    const association = await this.projectService.findProjectUser(
      project.id,
      user.id,
    );

    const roles = this.reflector.get(Roles, ctx.getHandler());
    if (!roles || !roles.length) {
      return true;
    }

    if (!matchRoles(association.role, roles)) {
      throw new ForbiddenException(authErrors.ROLE_MISMATCH);
    }
    return true;
  }
}
