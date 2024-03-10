import { Entity, Column, PrimaryColumn, ManyToOne } from 'typeorm';
import { Ticket } from '~/tickets/ticket.entity';
import { Skill, SkillLevel } from './skill.entity';

@Entity({ name: 'ticket_skills' })
export class TicketSkill {
  @Column({
    default: SkillLevel.Beginner,
  })
  level: number;

  @ManyToOne(() => Ticket)
  @PrimaryColumn({ name: 'ticketId' })
  ticket: Ticket;

  @ManyToOne(() => Skill)
  @PrimaryColumn({ name: 'skillId' })
  skill: Skill;
}
