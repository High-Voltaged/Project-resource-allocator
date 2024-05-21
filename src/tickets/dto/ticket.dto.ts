import {
  ArgsType,
  Field,
  ObjectType,
  OmitType,
  PartialType,
} from '@nestjs/graphql';
import { Ticket, TicketPriority, TicketStatus } from '../ticket.entity';
import { IsUUID, Max, Min } from 'class-validator';
import { RemoveMySkillsInput, UpdateMySkillsInput } from '~/users/dto/user.dto';
import { Skill } from '~/skills/skill.entity';
import { TICKET_VALIDATION } from '../ticket.validation';
import { SKILL_VALIDATION } from '~/skills/skill.validation';

@ArgsType()
export class CreateTicketInput {
  @Min(TICKET_VALIDATION.TITLE_MIN_LENGTH)
  @Max(TICKET_VALIDATION.TITLE_MAX_LENGTH)
  @Field()
  title: string;

  @Min(TICKET_VALIDATION.DESCRIPTION_MIN_LENGTH)
  @Max(TICKET_VALIDATION.DESCRIPTION_MAX_LENGTH)
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
export class RemoveTicketSkillsInput extends RemoveMySkillsInput {
  @Field()
  ticketId: string;
}

@ObjectType()
export class TicketWithRelationsOutput extends Ticket {
  @Field(() => [Skill])
  skills: Skill[];
}

@ArgsType()
export class AddSkillInput {
  @Min(SKILL_VALIDATION.NAME_MIN_LENGTH)
  @Max(SKILL_VALIDATION.NAME_MAX_LENGTH)
  @Field()
  name: string;
}
