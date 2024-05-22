import {
  BadRequestException,
  ForbiddenException,
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
import { UserService } from '~/users/user.service';
import userErrors from '~/users/user.constants';
import { TicketSkill } from './ticket_skill.entity';
import { Skill } from '~/skills/skill.entity';
import authErrors from '~/auth/const/auth.errors';
import { Assignee } from './assignee.entity';
import { User } from '~/users/user.entity';

@Injectable()
export class TicketService {
  constructor(
    @InjectRepository(Ticket)
    private ticketRepository: Repository<Ticket>,
    @InjectRepository(Assignee)
    private assigneeRepository: Repository<Assignee>,
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

  async findAllUnassigned(projectId: string): Promise<Ticket[]> {
    const project = await this.projectService.findOneById(projectId);
    if (!project) {
      throw new NotFoundException(projectErrors.NOT_FOUND);
    }

    const tickets = await this.ticketRepository
      .createQueryBuilder('t')
      .leftJoin('t.assignees', 'assignee')
      .innerJoinAndMapMany('t.levels', TicketSkill, 'ts', 'ts.ticket_id = t.id')
      .innerJoinAndMapMany('t.skillLevels', Skill, 's', 'ts.skill_id = s.id')
      .where('t.project_id = :projectId', { projectId })
      .andWhere('assignee.user_id IS NULL')
      .getMany();

    return tickets.map((ticket) => {
      ticket.skillLevels = ticket.skillLevels.map((skill, i) => ({
        ...skill,
        level: (ticket as any).levels[i].level,
      }));
      return ticket;
    });
  }

  async findAllByUserId(userId: string): Promise<Ticket[]> {
    const user = await this.userService.findOneById(userId);
    if (!user) {
      throw new NotFoundException(userErrors.ID_NOT_FOUND);
    }

    return this.ticketRepository.find({
      where: { assignees: { userId } },
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
        .leftJoin(TicketSkill, 'ts', 'ts.ticket_id = :id', { id })
        .leftJoinAndMapMany('t.skills', Skill, 's', 'ts.skill_id = s.id')
        .leftJoin('t.assignees', 'assignees')
        .leftJoinAndMapMany(
          't.assignees',
          User,
          'u',
          'u.id = assignees.user_id',
        )
        .leftJoinAndSelect('t.reporter', 'reporter')
        .loadRelationIdAndMap('t.projectId', 't.project')
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

  async assignmentPreCheck({ ticketId, userId }: AssignTicketInput) {
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
    return ticket;
  }

  async assignTicketToUser(
    allocatorId: string,
    { ticketId, userId }: AssignTicketInput,
  ) {
    const ticket = await this.assignmentPreCheck({ ticketId, userId });

    const alreadyAssigned = ticket.assignees.some(
      (assignee) => assignee.userId === userId,
    );

    if (alreadyAssigned) {
      throw new BadRequestException(ticketErrors.ALREADY_ASSIGNED);
    }

    await this.assigneeRepository.save({ userId, ticketId, allocatorId });
  }

  async unassignTicketFromUser({ ticketId, userId }: AssignTicketInput) {
    const ticket = await this.assignmentPreCheck({ ticketId, userId });

    const notAssigned = ticket.assignees.every(
      (assignee) => assignee.userId !== userId,
    );

    if (notAssigned) {
      throw new BadRequestException(ticketErrors.ALREADY_ASSIGNED);
    }

    await this.assigneeRepository.delete({ ticketId, userId });
  }

  async updateTicket({ id, ...data }: UpdateTicketInput) {
    await this.ticketRepository.update(id, data);
    return this.ticketRepository.findOne({ where: { id } });
  }

  async deleteTicket(userId: string, ticketId: string) {
    const ticket = await this.findOneById(ticketId, {
      relations: ['reporter'],
    });

    if (ticket.reporter.id !== userId) {
      throw new ForbiddenException(authErrors.ROLE_MISMATCH);
    }

    return this.ticketRepository.delete(ticketId);
  }
}
