import { Module } from '@nestjs/common';
import { SkillService } from './skill.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Skill } from './skill.entity';
import { UserSkill } from '~/users/user_skill.entity';
import { TicketSkill } from '../tickets/ticket_skill.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Skill, UserSkill, TicketSkill])],
  providers: [SkillService],
  exports: [SkillService],
})
export class SkillModule {}
