import {
  ArgsType,
  Field,
  ObjectType,
  PartialType,
  registerEnumType,
} from '@nestjs/graphql';
import { Project, ProjectType } from '../project.entity';
import { IsEnum, IsUUID } from 'class-validator';
import { UserRole } from '~/users/user.entity';

registerEnumType(ProjectType, { name: 'ProjectType' });

@ArgsType()
export class CreateProjectInput {
  @Field()
  name: string;

  @Field(() => ProjectType)
  type: ProjectType;
}

@ArgsType()
export class UpdateProjectInput extends PartialType(CreateProjectInput) {
  @Field()
  id: string;
}

@ArgsType()
export class AddUserToProjectInput {
  @IsUUID()
  @Field()
  projectId: string;

  @IsUUID()
  @Field()
  userId: string;

  @IsEnum(UserRole)
  @Field()
  role: UserRole;
}

@ObjectType()
export class MyProject extends Project {
  @Field(() => UserRole)
  role: UserRole;
}
