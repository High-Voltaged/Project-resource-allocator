import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

export enum TicketStatus {
  backlog = 'backlog',
  todo = 'todo',
  inprogress = 'inprogress',
  review = 'review',
  testing = 'testing',
  deployed = 'deployed',
}

@Entity({ name: 'tickets' })
export class Ticket {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column()
  description: string;

  @Column({
    type: 'enum',
    enum: TicketStatus,
    default: TicketStatus.todo,
  })
  status: string;

  // Consider 0 the lowest priority
  @Column({ default: 0 })
  priority: number;

  @CreateDateColumn()
  createdAt: Date;

  @Column({ name: 'due_to', type: 'date' })
  dueTo: Date;

  @Column({ name: 'project_id' })
  projectId: string;

  @Column({ name: 'reporter_id' })
  reporterId: string;
}
