import {
  ArgsType,
  Field,
  ObjectType,
  OmitType,
  PartialType,
} from '@nestjs/graphql';
import { Ticket, TicketPriority, TicketStatus } from '../ticket.entity';
import { IsUUID } from 'class-validator';
import { UpdateMySkillsInput } from '~/users/dto/user.dto';
import { Skill } from '~/skills/skill.entity';

@ArgsType()
export class CreateTicketInput {
  @Field()
  title: string;

  @Field()
  description: string;

  @Field(() => TicketStatus, { defaultValue: TicketStatus.todo })
  status: TicketStatus;

  @Field(() => TicketPriority, { defaultValue: TicketPriority.lowest })
  priority: TicketPriority;

  @Field({ nullable: true })
  dueTo: Date;

  @Field()
  @IsUUID()
  projectId: string;
}

@ArgsType()
export class UpdateTicketInput extends PartialType(
  OmitType(CreateTicketInput, ['projectId']),
) {
  @IsUUID()
  @Field()
  id: string;
}

@ArgsType()
export class AssignTicketInput {
  @IsUUID()
  @Field()
  userId: string;

  @IsUUID()
  @Field()
  ticketId: string;
}

@ArgsType()
export class UpdateTicketSkillsInput extends UpdateMySkillsInput {
  @Field()
  ticketId: string;
}

@ArgsType()
export class RemoveTicketSkillsInput {
  @Field()
  ticketId: string;

  @Field(() => [String])
  skillNames: string[];
}

@ObjectType()
export class TicketWithRelationsOutput extends Ticket {
  @Field(() => [Skill])
  skills: Skill[];
}

@ArgsType()
export class AddSkillInput {
  @Field()
  name: string;
}
