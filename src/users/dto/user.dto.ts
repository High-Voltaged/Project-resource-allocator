import {
  ArgsType,
  Field,
  InputType,
  ObjectType,
  OmitType,
} from '@nestjs/graphql';
import { SkillLevel } from '~/skills/skill.entity';
import {
  IsEnum,
  IsOptional,
  IsUUID,
  Max,
  Min,
  ValidateIf,
} from 'class-validator';
import { User, UserRole } from '../user.entity';

@InputType()
export class UserSkillInput {
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

@ObjectType()
export class UserSkillOutput {
  @Min(SkillLevel.Beginner)
  @Max(SkillLevel.Proficient)
  @Field()
  level: SkillLevel;

  @Field()
  name: string;
}

@ArgsType()
export class ProjectUsersInput {
  @IsUUID()
  @Field()
  projectId: string;

  @IsOptional()
  @IsEnum(UserRole)
  @Field({ nullable: true })
  role?: UserRole;
}

@ObjectType()
export class ProjectUserOutput extends OmitType(User, [
  'isAvailable',
  'password',
]) {
  @Field()
  role: UserRole;
}
