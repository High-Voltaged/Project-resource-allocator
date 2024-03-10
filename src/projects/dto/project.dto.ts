import { ArgsType, Field, PartialType } from '@nestjs/graphql';
import { ProjectType } from '../project.entity';

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
