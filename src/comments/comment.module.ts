import { Module } from '@nestjs/common';
import { CommentService } from './comment.service';
import { CommentResolver } from './comment.resolver';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Comment } from './comment.entity';
import { TicketModule } from '~/tickets/ticket.module';
import { ProjectModule } from '~/projects/project.module';

@Module({
  imports: [TypeOrmModule.forFeature([Comment]), TicketModule, ProjectModule],
  providers: [CommentService, CommentResolver],
  exports: [CommentService],
})
export class CommentModule {}
