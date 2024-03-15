import { ArgsType, Field } from '@nestjs/graphql';
import { IsUUID } from 'class-validator';

@ArgsType()
export class UUIDInput {
  @IsUUID()
  @Field()
  id: string;
}
