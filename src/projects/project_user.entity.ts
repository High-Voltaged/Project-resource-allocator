import { Entity, Column, PrimaryColumn, ManyToOne } from 'typeorm';
import { User, UserRole } from '~/users/user.entity';
import { Project } from './project.entity';

@Entity({ name: 'project_users' })
export class ProjectUser {
  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.Employee,
  })
  role: UserRole;

  @ManyToOne(() => User)
  @PrimaryColumn({ name: 'userId' })
  user: User;

  @ManyToOne(() => Project)
  @PrimaryColumn({ name: 'projectId' })
  project: Project;
}
