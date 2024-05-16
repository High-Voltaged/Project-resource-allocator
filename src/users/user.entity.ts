import { Field, ObjectType, OmitType, registerEnumType } from '@nestjs/graphql';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { Ticket } from '../tickets/ticket.entity';

export enum UserRole {
  Admin = 'Admin',
  Manager = 'Manager',
  Employee = 'Employee',
}

registerEnumType(UserRole, { name: 'UserRole' });

@ObjectType()
@Entity({ name: 'users' })
export class User {
  @Field()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field()
  @Column({ name: 'first_name' })
  firstName: string;

  @Field()
  @Column({ name: 'last_name' })
  lastName: string;

  @Field()
  @Column({ unique: true })
  email: string;

  @Field()
  @Column({ select: false })
  password: string;

  @Field()
  @Column({ default: true })
  isAvailable: boolean;

  @Field(() => [Ticket])
  @ManyToMany(() => Ticket)
  @JoinTable({ name: 'assignees' })
  tickets: Ticket[];
}

@ObjectType()
export class UserOutput extends OmitType(User, ['password', 'tickets']) {}
