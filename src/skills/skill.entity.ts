import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

export enum SkillLevel {
  Beginner,
  Intermediate,
  Proficient,
}

@Entity({ name: 'skills' })
export class Skill {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;
}
