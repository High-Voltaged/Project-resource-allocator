import { ArgsType, Field, ObjectType, PartialType } from '@nestjs/graphql';
import { Project, ProjectType } from '../project.entity';
import { IsUUID, MaxLength, MinLength } from 'class-validator';
import { UserRole } from '~/users/user.entity';
import { PaginatedType } from '~/shared/pagination.dto';
import { PROJECT_VALIDATION } from '../project.validation';

@ArgsType()
export class CreateProjectInput {
  @MinLength(PROJECT_VALIDATION.NAME_MIN_LENGTH)
  @MaxLength(PROJECT_VALIDATION.NAME_MAX_LENGTH)
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

  @Field()
  email: string;

  @Field(() => UserRole)
  role: UserRole;
}

@ObjectType()
export class MyProject extends Project {
  @Field(() => UserRole)
  role: UserRole;
}

@ObjectType()
export class MyProjectsOutput extends PaginatedType {
  @Field(() => [MyProject])
  items: MyProject[];
}
