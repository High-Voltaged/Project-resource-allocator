import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { CommentService } from './comment.service';
import { Comment } from './comment.entity';
import { Roles } from '~/auth/decorators/roles.decorator';
import { User, UserRole } from '~/users/user.entity';
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

  //! unprotected mutation
  @Mutation(() => Boolean)
  async deleteComment(@Args() { id }: UUIDInput): Promise<boolean> {
    await this.commentService.delete(id);
    return true;
  }
}
