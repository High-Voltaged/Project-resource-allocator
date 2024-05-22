import { Field, ObjectType, registerEnumType } from '@nestjs/graphql';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { Project } from '~/projects/project.entity';
import { UserSkillOutput } from '~/users/dto/user.dto';
import { User } from '~/users/user.entity';
import { Assignee } from './assignee.entity';

export enum TicketStatus {
  backlog = 'backlog',
  todo = 'todo',
  inprogress = 'inprogress',
  testing = 'testing',
  deployed = 'deployed',
}

export enum TicketPriority {
  lowest = 'lowest',
  low = 'low',
  medium = 'medium',
  high = 'high',
  highest = 'highest',
}

registerEnumType(TicketStatus, { name: 'TicketStatus' });
registerEnumType(TicketPriority, { name: 'TicketPriority' });

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

  @Field(() => TicketStatus)
  @Column({
    type: 'enum',
    enum: TicketStatus,
    default: TicketStatus.todo,
  })
  status: TicketStatus;

  @Field(() => TicketPriority)
  @Column({
    type: 'enum',
    enum: TicketPriority,
    default: TicketPriority.lowest,
  })
  priority: TicketPriority;

  @Field(() => Date)
  @CreateDateColumn()
  createdAt: Date;

  @Field({ nullable: true })
  @Column({ name: 'due_to', type: 'date', nullable: true })
  dueTo?: Date;

  @Field()
  projectId: string;

  @Field(() => Project)
  @ManyToOne(() => Project, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'project_id' })
  project: Project;

  @Field(() => User)
  @ManyToOne(() => User, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'reporter_id' })
  reporter: User;

  @Field(() => [User])
  @OneToMany(() => Assignee, (assignee) => assignee.ticket)
  assignees: Assignee[];

  skillLevels: UserSkillOutput[];
}
