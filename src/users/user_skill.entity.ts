import { Entity, Column, ManyToOne, PrimaryColumn } from 'typeorm';
import { User } from './user.entity';
import { Skill, SkillLevel } from '~/skills/skill.entity';

@Entity({ name: 'user_skills' })
export class UserSkill {
  @Column({
    default: SkillLevel.Beginner,
  })
  level: SkillLevel;

  @ManyToOne(() => User)
  @PrimaryColumn({ name: 'userId' })
  user: User;

  @ManyToOne(() => Skill)
  @PrimaryColumn({ name: 'skillId' })
  skill: Skill;
}
