import { Field, ObjectType } from '@nestjs/graphql';
import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

export enum UserRole {
  Admin = 'admin',
  Manager = 'manager',
  Employee = 'employee',
}

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
  @Column()
  password: string;

  @Field()
  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.Employee,
  })
  role: UserRole;

  @Field()
  @Column({ default: true })
  isAvailable: boolean;
}
