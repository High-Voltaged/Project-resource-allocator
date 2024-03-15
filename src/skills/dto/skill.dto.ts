import { PickType } from '@nestjs/graphql';
import { Skill } from '../skill.entity';

export class SkillNameDto extends PickType(Skill, ['name']) {}
