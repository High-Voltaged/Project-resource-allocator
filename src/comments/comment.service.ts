import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Comment } from './comment.entity';
import { CreateCommentInput } from './dto/comment.dto';
import { TicketService } from '~/tickets/ticket.service';

@Injectable()
export class CommentService {
  constructor(
    @InjectRepository(Comment)
    private commentRepository: Repository<Comment>,
    private ticketService: TicketService,
  ) {}

  async findAllByTicketId(ticketId: string): Promise<Comment[]> {
    await this.ticketService.findOneById(ticketId);

    return this.commentRepository.find({
      where: {
        ticket: { id: ticketId },
      },
    });
  }

  async create(data: CreateCommentInput, author: string): Promise<Comment> {
    const { ticketId } = data;
    await this.ticketService.findOneById(data.ticketId);

    return this.commentRepository.save({
      ...data,
      ticket: { id: ticketId },
      author: { id: author },
    });
  }

  delete(id: string) {
    return this.commentRepository.delete(id);
  }
}
