import { Module } from '@nestjs/common';
import { TicketService } from './ticket.service';
import { TicketResolver } from './ticket.resolver';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Ticket } from './ticket.entity';
import { ProjectModule } from '~/projects/project.module';
import { ProjectUser } from '~/projects/project_user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Ticket, ProjectUser]), ProjectModule],
  providers: [TicketService, TicketResolver],
  exports: [TicketService],
})
export class TicketModule {}
