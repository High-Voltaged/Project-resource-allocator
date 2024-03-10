import { ArgsType, Field, ID, PartialType } from '@nestjs/graphql';
import { TicketStatus } from '../ticket.entity';
import { IsEnum, IsUUID } from 'class-validator';

@ArgsType()
export class CreateTicketInput {
  @Field()
  title: string;

  @Field()
  description: string;

  @Field({ defaultValue: TicketStatus.todo })
  @IsEnum(TicketStatus)
  status: TicketStatus;

  @Field({ defaultValue: 0 })
  priority: number;

  @Field()
  dueTo: Date;

  @Field()
  @IsUUID()
  projectId: string;
}

@ArgsType()
export class UpdateTicketInput extends PartialType(CreateTicketInput) {
  @Field(() => ID)
  id: string;
}
