import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOneOptions, Repository } from 'typeorm';
import { Ticket } from './ticket.entity';
import {
  AssignTicketInput,
  CreateTicketInput,
  UpdateTicketInput,
} from './dto/ticket.dto';
import { ProjectService } from '~/projects/project.service';
import projectErrors from '~/projects/project.constants';
import ticketErrors from './ticket.constants';
import { User } from '~/users/user.entity';
import { UserService } from '~/users/user.service';
import userErrors from '~/users/user.constants';
import { TicketSkill } from './ticket_skill.entity';
import { Skill } from '~/skills/skill.entity';

@Injectable()
export class TicketService {
  constructor(
    @InjectRepository(Ticket)
    private ticketRepository: Repository<Ticket>,
    private projectService: ProjectService,
    private userService: UserService,
  ) {}

  async findAllByProjectId(projectId: string): Promise<Ticket[]> {
    const project = await this.projectService.findOneById(projectId);
    if (!project) {
      throw new NotFoundException(projectErrors.NOT_FOUND);
    }

    return this.ticketRepository.find({
      where: { project: { id: projectId } },
      relations: ['reporter'],
    });
  }

  async findAllByUserId(userId: string): Promise<Ticket[]> {
    const user = await this.userService.findOneById(userId);
    if (!user) {
      throw new NotFoundException(userErrors.ID_NOT_FOUND);
    }

    return this.ticketRepository.find({
      where: { assignees: { id: userId } },
    });
  }

  async findOneById(id: string, options: FindOneOptions<Ticket> = {}) {
    try {
      const ticket = await this.ticketRepository.findOneOrFail({
        where: { id },
        ...options,
      });
      return ticket;
    } catch (err) {
      throw new NotFoundException(ticketErrors.NOT_FOUND);
    }
  }

  async findOneWithRelations(id: string) {
    try {
      const ticket = await this.ticketRepository
        .createQueryBuilder('t')
        .select()
        .innerJoin(TicketSkill, 'ts', 'ts.ticket_id = :id', { id })
        .innerJoinAndMapMany('t.skills', Skill, 's', 'ts.skill_id = s.id')
        .leftJoinAndSelect('t.assignees', 'assignees')
        .where('t.id = :id', { id })
        .getOneOrFail();

      return ticket;
    } catch (err) {
      throw new NotFoundException(ticketErrors.NOT_FOUND);
    }
  }

  async createTicket(
    ticket: CreateTicketInput,
    reporterId: string,
  ): Promise<Ticket> {
    const created = await this.ticketRepository.save({
      reporter: { id: reporterId },
      project: { id: ticket.projectId },
      ...ticket,
    });

    return created;
  }

  async assignTicketToUser({ ticketId, userId }: AssignTicketInput) {
    const ticket = await this.findOneById(ticketId, {
      relations: ['assignees', 'project'],
    });

    const projectUser = await this.projectService.findProjectUser(
      ticket.project.id,
      userId,
    );

    if (!projectUser) {
      throw new BadRequestException(projectErrors.NO_PROJECT_USER);
    }

    const alreadyAssigned = ticket.assignees.some(
      (assignee) => assignee.id === userId,
    );

    if (alreadyAssigned) {
      throw new BadRequestException(ticketErrors.ALREADY_ASSIGNED);
    }

    ticket.assignees.push({ id: userId } as User);

    await this.ticketRepository.save(ticket);
  }

  async updateTicket({ id, ...data }: UpdateTicketInput) {
    await this.ticketRepository.update(id, data);
    return this.ticketRepository.findOne({ where: { id } });
  }

  deleteTicket(ticketId: string) {
    return this.ticketRepository.delete(ticketId);
  }
}
