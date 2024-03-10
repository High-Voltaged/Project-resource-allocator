import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

export enum UserRole {
  Admin = 'admin',
  Manager = 'manager',
  Employee = 'employee',
}

@Entity({ name: 'users' })
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: number;

  @Column({ name: 'first_name' })
  firstName: string;

  @Column({ name: 'last_name' })
  lastName: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.Employee,
  })
  role: UserRole;

  @Column({ default: true })
  isAvailable: boolean;
}
