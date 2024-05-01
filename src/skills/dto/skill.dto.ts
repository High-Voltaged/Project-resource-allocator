import { Field, InputType, PickType } from '@nestjs/graphql';
import { Skill, SkillLevel } from '../skill.entity';
import { Max, Min } from 'class-validator';

export class SkillNameInput extends PickType(Skill, ['name']) {}

@InputType()
export class SkillInput {
  @Min(SkillLevel.Beginner)
  @Max(SkillLevel.Proficient)
  @Field()
  level: SkillLevel;

  @Field()
  name: string;
}
