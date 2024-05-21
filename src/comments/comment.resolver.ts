import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { CommentService } from './comment.service';
import { Comment } from './comment.entity';
import { User } from '~/users/user.entity';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '~/auth/guards/jwt.guard';
import { CreateCommentInput } from './dto/comment.dto';
import { CurrentUser } from '~/auth/decorators/current_user.decorator';
import { UUIDInput } from '~/shared/dto';
import { TicketGuard } from '~/auth/guards/associate/ticket.guard';

@UseGuards(JwtAuthGuard)
@Resolver(() => Comment)
export class CommentResolver {
  constructor(private readonly commentService: CommentService) {}

  @UseGuards(TicketGuard)
  @Query(() => [Comment])
  commentsByTicketId(@Args('id') id: string): Promise<Comment[]> {
    return this.commentService.findAllByTicketId(id);
  }

  @UseGuards(TicketGuard)
  @Mutation(() => Comment)
  createComment(
    @Args() input: CreateCommentInput,
    @CurrentUser() user: User,
  ): Promise<Comment> {
    return this.commentService.create(input, user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Mutation(() => Boolean)
  async deleteComment(
    @CurrentUser() user: User,
    @Args() { id }: UUIDInput,
  ): Promise<boolean> {
    await this.commentService.delete(user.id, id);
    return true;
  }
}
