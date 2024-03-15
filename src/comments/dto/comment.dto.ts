import { ArgsType, Field, PartialType } from '@nestjs/graphql';

@ArgsType()
export class CreateCommentInput {
  @Field()
  content: string;

  @Field()
  ticketId: string;
}

@ArgsType()
export class UpdateCommentInput extends PartialType(CreateCommentInput) {}
