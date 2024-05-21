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
import { PaginatedType, PaginationArgs } from '~/shared/pagination.dto';

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
export class ProjectUsersInput extends PaginationArgs {
  @IsUUID()
  @Field()
  projectId: string;

  @IsOptional()
  @IsEnum(UserRole)
  @Field(() => UserRole, { nullable: true })
  role?: UserRole;
}

@ObjectType()
export class ProjectUser extends OmitType(User, [
  'isAvailable',
  'password',
  'tickets',
]) {
  @Field()
  role: UserRole;
}

@ObjectType()
export class ProjectUsersOutput extends PaginatedType {
  @Field(() => [ProjectUser])
  items: ProjectUser[];
}

@ArgsType()
export class UpdateMyProfileInput extends PartialType(
  OmitType(RegisterInput, ['password']),
) {
  @Field({ nullable: true })
  isAvailable: boolean;
}

@ArgsType()
export class UpdateMySkillsInput {
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => SkillInput)
  @Field(() => [SkillInput], { nullable: true })
  skills: SkillInput[];
}

@ArgsType()
export class RemoveMySkillsInput {
  @Field(() => [String])
  skillNames: string[];
}
