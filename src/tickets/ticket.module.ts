import { Module } from '@nestjs/common';
import { TicketService } from './ticket.service';
import { TicketResolver } from './ticket.resolver';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Ticket } from './ticket.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Ticket])],
  providers: [TicketService, TicketResolver],
  exports: [TicketService],
})
export class TicketModule {}
