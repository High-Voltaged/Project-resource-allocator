import { ArgsType, Field, Int, ObjectType } from '@nestjs/graphql';
import { Max, Min } from 'class-validator';

@ArgsType()
export class PaginationArgs {
  @Min(0)
  @Field(() => Int, { nullable: true })
  offset = 0;

  @Min(1)
  @Max(50)
  @Field(() => Int, { nullable: true })
  limit = 20;
}

@ObjectType()
export abstract class PaginatedType {
  @Field(() => Int)
  count: number;
}
