import { Entity, Column, PrimaryColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Ticket } from '~/tickets/ticket.entity';
import { Skill, SkillLevel } from '../skills/skill.entity';

@Entity({ name: 'ticket_skills' })
export class TicketSkill {
  @Column({
    default: SkillLevel.Beginner,
  })
  level: number;

  @ManyToOne(() => Ticket)
  @JoinColumn({ name: 'ticket_id' })
  ticket: Ticket;

  @PrimaryColumn({ name: 'ticket_id' })
  ticketId: string;

  @ManyToOne(() => Skill)
  @JoinColumn({ name: 'skill_id' })
  skill: Skill;

  @PrimaryColumn({ name: 'skill_id' })
  skillId: string;
}
