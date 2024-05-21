import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Comment } from './comment.entity';
import { CreateCommentInput } from './dto/comment.dto';
import { TicketService } from '~/tickets/ticket.service';
import authErrors from '~/auth/const/auth.errors';
import ticketErrors from '~/tickets/ticket.constants';

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
      relations: ['author'],
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

  async delete(userId: string, id: string) {
    const comment = await this.commentRepository.findOne({
      where: { id },
      relations: ['author'],
    });

    if (!comment) {
      throw new NotFoundException(ticketErrors.COMMENT_NOT_FOUND);
    }

    if (comment.author.id !== userId) {
      throw new ForbiddenException(authErrors.ROLE_MISMATCH);
    }

    return this.commentRepository.delete(id);
  }
}
