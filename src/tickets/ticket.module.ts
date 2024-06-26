import { Module } from '@nestjs/common';
import { TicketService } from './ticket.service';
import { TicketResolver } from './ticket.resolver';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Ticket } from './ticket.entity';
import { ProjectModule } from '~/projects/project.module';
import { ProjectUser } from '~/projects/project_user.entity';
import { SkillModule } from '~/skills/skill.module';
import { UserModule } from '~/users/user.module';
import { TicketSkill } from './ticket_skill.entity';
import { Assignee } from './assignee.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Ticket, ProjectUser, TicketSkill, Assignee]),
    ProjectModule,
    UserModule,
    SkillModule,
  ],
  providers: [TicketService, TicketResolver],
  exports: [TicketService],
})
export class TicketModule {}
