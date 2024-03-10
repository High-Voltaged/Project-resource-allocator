import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Ticket } from './ticket.entity';
import { CreateTicketInput, UpdateTicketInput } from './dto/ticket.dto';

@Injectable()
export class TicketService {
  constructor(
    @InjectRepository(Ticket)
    private ticketRepository: Repository<Ticket>,
  ) {}

  async findAllByProjectId(id: string): Promise<Ticket[]> {
    return this.ticketRepository.find({ where: { project: { id } } });
  }

  async findOneById(id: string) {
    return this.ticketRepository.findOne({ where: { id } });
  }

  async createTicket(ticket: CreateTicketInput, reporterId: string) {
    return this.ticketRepository.save({
      reporter: { id: reporterId },
      project: { id: ticket.projectId },
      ...ticket,
    });
  }

  async updateTicket({ id, ...data }: UpdateTicketInput) {
    await this.ticketRepository.update(id, {
      project: { id: data.projectId },
      ...data,
    });
    return this.ticketRepository.findOne({ where: { id } });
  }

  async deleteTicket(ticketId: string): Promise<void> {
    await this.ticketRepository.delete(ticketId);
  }
}
