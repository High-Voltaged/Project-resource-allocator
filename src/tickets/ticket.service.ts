import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOneOptions, Repository } from 'typeorm';
import { Ticket } from './ticket.entity';
import { CreateTicketInput, UpdateTicketInput } from './dto/ticket.dto';
import { ProjectService } from '~/projects/project.service';
import projectErrors from '~/projects/project.constants';
import ticketErrors from './ticket.constants';

@Injectable()
export class TicketService {
  constructor(
    @InjectRepository(Ticket)
    private ticketRepository: Repository<Ticket>,
    private projectService: ProjectService,
  ) {}

  async checkIfTicketExists(id: string) {
    const ticket = await this.findOneById(id);
    if (!ticket) {
      throw new NotFoundException(ticketErrors.NOT_FOUND);
    }
  }

  async findAllByProjectId(projectId: string): Promise<Ticket[]> {
    const project = await this.projectService.findOneById(projectId);
    if (!project) {
      throw new NotFoundException(projectErrors.NOT_FOUND);
    }

    return this.ticketRepository.find({
      where: { project: { id: projectId } },
    });
  }

  findOneById(id: string, options: FindOneOptions<Ticket> = {}) {
    return this.ticketRepository.findOne({ where: { id }, ...options });
  }

  createTicket(ticket: CreateTicketInput, reporterId: string): Promise<Ticket> {
    return this.ticketRepository.save({
      reporter: { id: reporterId },
      project: { id: ticket.projectId },
      ...ticket,
    });
  }

  async updateTicket({ id, ...data }: UpdateTicketInput) {
    await this.ticketRepository.update(id, {
      ...data,
    });
    return this.ticketRepository.findOne({ where: { id } });
  }

  deleteTicket(ticketId: string) {
    return this.ticketRepository.delete(ticketId);
  }
}

// assign a ticket to someone manually
// when creating a ticket, also include required skills
// when defining a skill, check if it exists;
// if it doesn't, create the skill first
