import { Entity, Column, ManyToOne, PrimaryColumn, JoinColumn } from 'typeorm';
import { User } from './user.entity';
import { Skill, SkillLevel } from '~/skills/skill.entity';

@Entity({ name: 'user_skills' })
export class UserSkill {
  @Column({
    default: SkillLevel.Beginner,
  })
  level: SkillLevel;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @PrimaryColumn({ name: 'user_id' })
  userId: string;

  @ManyToOne(() => Skill, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'skill_id' })
  skill: Skill;

  @PrimaryColumn({ name: 'skill_id' })
  skillId: string;
}
