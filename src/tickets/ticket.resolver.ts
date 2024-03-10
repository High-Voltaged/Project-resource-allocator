import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { TicketService } from './ticket.service';
import { Ticket } from './ticket.entity';
import { NotFoundException, UseGuards } from '@nestjs/common';
import { RolesGuard } from '~/auth/guards/roles.guard';
import { Roles } from '~/auth/decorators/roles.decorator';
import { User, UserRole } from '~/users/user.entity';
import { CreateTicketInput, UpdateTicketInput } from './dto/ticket.dto';
import { JwtAuthGuard } from '~/auth/guards/jwt.guard';
import { CurrentUser } from '~/auth/decorators/current_user.decorator';
import ticketErrors from './ticket.constants';

@UseGuards(JwtAuthGuard, RolesGuard)
@Resolver(() => Ticket)
export class TicketResolver {
  constructor(private readonly ticketService: TicketService) {}

  @Query(() => [Ticket])
  async ticketsByProjectId(@Args('projectId') id: string) {
    return this.ticketService.findAllByProjectId(id);
  }

  @Query(() => Ticket)
  async ticketById(@Args('id') id: string) {
    const found = await this.ticketService.findOneById(id);

    if (!found) {
      throw new NotFoundException(ticketErrors.NOT_FOUND);
    }

    return found;
  }

  @Mutation(() => Ticket)
  async createTicket(
    @CurrentUser() user: User,
    @Args() data: CreateTicketInput,
  ): Promise<Ticket> {
    return this.ticketService.createTicket(data, user.id);
  }

  @Mutation(() => Ticket)
  async updateTicket(@Args() data: UpdateTicketInput) {
    return this.ticketService.updateTicket(data);
  }

  @Roles([UserRole.Admin, UserRole.Manager])
  @Mutation(() => Boolean)
  async deleteTicket(@Args('id') id: string): Promise<boolean> {
    await this.ticketService.deleteTicket(id);
    return true;
  }
}
