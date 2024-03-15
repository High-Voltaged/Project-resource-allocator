import { ArgsType, Field, PartialType } from '@nestjs/graphql';
import { ProjectType } from '../project.entity';
import { IsEnum, IsUUID } from 'class-validator';
import { UserRole } from '~/users/user.entity';

@ArgsType()
export class CreateProjectInput {
  @Field()
  name: string;

  @Field()
  type: ProjectType;

  @Field()
  startAt: Date;
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
