import { Field, InputType, PickType } from '@nestjs/graphql';
import { Skill, SkillLevel } from '../skill.entity';
import { IsUUID, Max, Min, ValidateIf } from 'class-validator';

export class SkillNameInput extends PickType(Skill, ['name']) {}

@InputType()
export class SkillInput {
  @Min(SkillLevel.Beginner)
  @Max(SkillLevel.Proficient)
  @Field()
  level: SkillLevel;

  @ValidateIf((obj, v) => v || !obj.skillName)
  @IsUUID()
  @Field({ nullable: true })
  skillId?: string;

  @ValidateIf((obj, v) => v || !obj.skillId)
  @Field({ nullable: true })
  skillName?: string;
}
