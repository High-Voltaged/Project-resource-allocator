import { Field, ObjectType } from '@nestjs/graphql';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { Project } from '~/projects/project.entity';
import { User } from '~/users/user.entity';

export enum TicketStatus {
  backlog = 'backlog',
  todo = 'todo',
  inprogress = 'inprogress',
  review = 'review',
  testing = 'testing',
  deployed = 'deployed',
}

@ObjectType()
@Entity({ name: 'tickets' })
export class Ticket {
  @Field()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field()
  @Column()
  title: string;

  @Field()
  @Column()
  description: string;

  @Field()
  @Column({
    type: 'enum',
    enum: TicketStatus,
    default: TicketStatus.todo,
  })
  status: string;

  // Consider 0 the lowest priority
  @Field()
  @Column({ default: 0 })
  priority: number;

  @CreateDateColumn()
  createdAt: Date;

  @Field()
  @Column({ name: 'due_to', type: 'date' })
  dueTo: Date;

  @ManyToOne(() => Project)
  @JoinColumn({ name: 'project_id' })
  project: Project;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'reporter_id' })
  reporter: User;

  @Field(() => [User])
  @ManyToMany(() => User)
  @JoinTable({ name: 'assignees' })
  assignees: User[];
}
