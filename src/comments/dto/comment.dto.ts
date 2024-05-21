import { ArgsType, Field, PartialType } from '@nestjs/graphql';
import { Max, Min } from 'class-validator';
import { COMMENT_VALIDATION } from '../comment.validation';

@ArgsType()
export class CreateCommentInput {
  @Min(COMMENT_VALIDATION.CONTENT_MIN_LENGTH)
  @Max(COMMENT_VALIDATION.CONTENT_MAX_LENGTH)
  @Field()
  content: string;

  @Field()
  ticketId: string;
}

@ArgsType()
export class UpdateCommentInput extends PartialType(CreateCommentInput) {}
