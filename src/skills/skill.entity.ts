import { Field, ObjectType } from '@nestjs/graphql';
import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

export enum SkillLevel {
  Beginner = 1,
  Intermediate = 2,
  Proficient = 3,
}

@ObjectType()
@Entity({ name: 'skills' })
export class Skill {
  @Field()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field()
  @Column({ unique: true })
  name: string;
}
