import { Field, ObjectType } from '@nestjs/graphql';
import { Entity, Column, PrimaryColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Ticket } from '~/tickets/ticket.entity';
import { User } from '~/users/user.entity';

@Entity({ name: 'assignee' })
@ObjectType()
export class Assignee {
  @ManyToOne(() => Ticket, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'ticket_id' })
  ticket: Ticket;

  @Field()
  @PrimaryColumn({ name: 'ticket_id' })
  ticketId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Field()
  @PrimaryColumn({ name: 'user_id' })
  userId: string;

  @ManyToOne(() => User, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'allocator_id' })
  allocator: User;

  @Field()
  @Column({ name: 'allocator_id', nullable: true })
  allocatorId: string;

  @Field()
  @Column({ name: 'allocation_id', generated: 'uuid' })
  allocationId: string;

  @Field({ defaultValue: true })
  @Column({ name: 'is_confirmed', default: true })
  isConfirmed: boolean;
}
