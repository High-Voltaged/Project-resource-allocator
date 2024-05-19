import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { TicketService } from './ticket.service';
import { Ticket } from './ticket.entity';
import { UseGuards } from '@nestjs/common';
import { Roles } from '~/auth/decorators/roles.decorator';
import { User, UserRole } from '~/users/user.entity';
import {
  AssignTicketInput,
  CreateTicketInput,
  TicketWithRelationsOutput,
  UpdateTicketInput,
  UpdateTicketSkillsInput,
} from './dto/ticket.dto';
import { JwtAuthGuard } from '~/auth/guards/jwt.guard';
import { CurrentUser } from '~/auth/decorators/current_user.decorator';
import { UUIDInput } from '~/shared/dto';
import { ProjectGuard } from '~/auth/guards/associate/project.guard';
import { TicketGuard } from '~/auth/guards/associate/ticket.guard';
import { SkillService } from '~/skills/skill.service';
import { Skill } from '~/skills/skill.entity';

@UseGuards(JwtAuthGuard)
@Resolver(() => Ticket)
export class TicketResolver {
  constructor(
    private readonly ticketService: TicketService,
    private readonly skillService: SkillService,
  ) {}

  @UseGuards(ProjectGuard)
  @Query(() => [Ticket])
  ticketsByProjectId(@Args() { id }: UUIDInput) {
    return this.ticketService.findAllByProjectId(id);
  }

  @UseGuards(TicketGuard)
  @Query(() => TicketWithRelationsOutput)
  ticketById(@Args() { id }: UUIDInput) {
    return this.ticketService.findOneWithRelations(id);
  }

  @UseGuards(TicketGuard)
  @Query(() => [Ticket])
  ticketsByUserId(@Args() { id }: UUIDInput) {
    return this.ticketService.findAllByUserId(id);
  }

  @UseGuards(JwtAuthGuard)
  @Query(() => [Skill])
  skills() {
    return this.skillService.findAll();
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
  @Mutation(() => Boolean)
  async updateTicketSkills(
    @Args() { ticketId, skills }: UpdateTicketSkillsInput,
  ) {
    await this.skillService.saveTicketSkills(ticketId, skills);
    return true;
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
