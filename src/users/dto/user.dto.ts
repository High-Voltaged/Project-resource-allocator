import { ArgsType, Field, ObjectType, OmitType } from '@nestjs/graphql';
import { Skill, SkillLevel } from '~/skills/skill.entity';
import { IsEnum, IsOptional, IsUUID, Max, Min } from 'class-validator';
import { User, UserRole } from '../user.entity';

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
