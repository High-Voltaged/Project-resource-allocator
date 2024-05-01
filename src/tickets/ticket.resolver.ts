import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { TicketService } from './ticket.service';
import { Ticket } from './ticket.entity';
import { NotFoundException, UseGuards } from '@nestjs/common';
import { Roles } from '~/auth/decorators/roles.decorator';
import { User, UserRole } from '~/users/user.entity';
import {
  AssignTicketInput,
  CreateTicketInput,
  UpdateTicketInput,
} from './dto/ticket.dto';
import { JwtAuthGuard } from '~/auth/guards/jwt.guard';
import { CurrentUser } from '~/auth/decorators/current_user.decorator';
import ticketErrors from './ticket.constants';
import { UUIDInput } from '~/shared/dto';
import { ProjectGuard } from '~/auth/guards/associate/project.guard';
import { TicketGuard } from '~/auth/guards/associate/ticket.guard';

@UseGuards(JwtAuthGuard)
@Resolver(() => Ticket)
export class TicketResolver {
  constructor(private readonly ticketService: TicketService) {}

  @UseGuards(ProjectGuard)
  @Query(() => [Ticket])
  ticketsByProjectId(@Args() { id }: UUIDInput) {
    return this.ticketService.findAllByProjectId(id);
  }

  @UseGuards(TicketGuard)
  @Query(() => Ticket)
  ticketById(@Args() { id }: UUIDInput) {
    return this.ticketService.findOneById(id);
  }

  @UseGuards(JwtAuthGuard)
  @Query(() => [Ticket])
  ticketsByUserId(@Args() { id }: UUIDInput) {
    return this.ticketService.findAllByUserId(id);
  }

  @UseGuards(ProjectGuard)
  @Mutation(() => Ticket)
  createTicket(
    @CurrentUser() user: User,
    @Args() data: CreateTicketInput,
  ): Promise<Ticket> {
    return this.ticketService.createTicket(data, user.id);
  }

  @UseGuards(TicketGuard)
  @Roles([UserRole.Admin, UserRole.Manager])
  @Mutation(() => Boolean)
  async assignTicketToUser(@Args() data: AssignTicketInput) {
    await this.ticketService.assignTicketToUser(data);
    return true;
  }

  @UseGuards(TicketGuard)
  @Mutation(() => Ticket)
  updateTicket(@Args() data: UpdateTicketInput) {
    return this.ticketService.updateTicket(data);
  }

  @UseGuards(TicketGuard)
  @Roles([UserRole.Admin, UserRole.Manager])
  @Mutation(() => Boolean)
  async deleteTicket(@Args() { id }: UUIDInput): Promise<boolean> {
    await this.ticketService.deleteTicket(id);
    return true;
  }
}
