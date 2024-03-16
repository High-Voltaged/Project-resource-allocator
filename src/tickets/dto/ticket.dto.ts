import { ArgsType, Field, PartialType } from '@nestjs/graphql';
import { TicketStatus } from '../ticket.entity';
import { ArrayMinSize, IsEnum, IsUUID, ValidateNested } from 'class-validator';
import { SkillInput } from '~/skills/dto/skill.dto';
import { Type } from 'class-transformer';

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

  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => SkillInput)
  @Field(() => [SkillInput])
  skills: SkillInput[];
}

@ArgsType()
export class UpdateTicketInput extends PartialType(CreateTicketInput) {
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
