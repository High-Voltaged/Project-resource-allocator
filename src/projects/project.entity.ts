import { Field, ObjectType, registerEnumType } from '@nestjs/graphql';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

export enum ProjectType {
  Scrum = 'Scrum',
  Kanban = 'Kanban',
}

registerEnumType(ProjectType, { name: 'ProjectType' });

@ObjectType()
@Entity({ name: 'projects' })
export class Project {
  @Field()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field()
  @Column()
  name: string;

  @Field(() => ProjectType)
  @Column({
    type: 'enum',
    enum: ProjectType,
    default: ProjectType.Scrum,
  })
  type: ProjectType;

  @Field()
  @CreateDateColumn({ name: 'start_at', type: 'timestamptz' })
  startAt: Date;
}
