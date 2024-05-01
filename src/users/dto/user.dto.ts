import {
  ArgsType,
  Field,
  ObjectType,
  OmitType,
  PartialType,
} from '@nestjs/graphql';
import { Skill, SkillLevel } from '~/skills/skill.entity';
import {
  ArrayMinSize,
  IsEnum,
  IsOptional,
  IsUUID,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';
import { User, UserRole } from '../user.entity';
import { RegisterInput } from '~/auth/dto/auth.dto';
import { SkillInput } from '~/skills/dto/skill.dto';
import { Type } from 'class-transformer';

@ObjectType()
export class UserSkillOutput {
  @Min(SkillLevel.Beginner)
  @Max(SkillLevel.Proficient)
  @Field()
  level: SkillLevel;

  @Field()
  name: string;
}

@ObjectType()
export class UserWithSkillsOutput extends OmitType(User, [
  'password',
  'tickets',
]) {
  @Field(() => [Skill])
  skills: Skill[];
}

@ObjectType()
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
  'tickets',
]) {
  @Field()
  role: UserRole;
}

@ArgsType()
export class UpdateMyProfileInput extends PartialType(
  OmitType(RegisterInput, ['password']),
) {}

@ArgsType()
export class UpdateMySkillsInput {
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => SkillInput)
  @Field(() => [SkillInput], { nullable: true })
  skills: SkillInput[];
}
