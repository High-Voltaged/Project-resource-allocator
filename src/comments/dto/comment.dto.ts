import { ArgsType, Field, PartialType } from '@nestjs/graphql';
import { MaxLength, MinLength } from 'class-validator';
import { COMMENT_VALIDATION } from '../comment.validation';

@ArgsType()
export class CreateCommentInput {
  @MinLength(COMMENT_VALIDATION.CONTENT_MIN_LENGTH)
  @MaxLength(COMMENT_VALIDATION.CONTENT_MAX_LENGTH)
  @Field()
  content: string;

  @Field()
  ticketId: string;
}

@ArgsType()
export class UpdateCommentInput extends PartialType(CreateCommentInput) {}
