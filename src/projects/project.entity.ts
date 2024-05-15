import { Field, ObjectType } from '@nestjs/graphql';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

export enum ProjectType {
  Scrum,
  Kanban,
}

@ObjectType()
@Entity({ name: 'projects' })
export class Project {
  @Field()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field()
  @Column()
  name: string;

  @Field()
  @Column({ default: ProjectType.Scrum })
  type: ProjectType;

  @Field()
  @CreateDateColumn({ name: 'start_at', type: 'timestamptz' })
  startAt: Date;
}
