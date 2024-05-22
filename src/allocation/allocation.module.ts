import { Module } from '@nestjs/common';
import { AllocationService } from './allocation.service';
import { AllocationResolver } from './allocation.resolver';
import { TicketModule } from '~/tickets/ticket.module';
import { UserModule } from '~/users/user.module';
import { ProjectModule } from '~/projects/project.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Assignee } from '~/tickets/assignee.entity';

@Module({
  providers: [AllocationService, AllocationResolver],
  imports: [
    TicketModule,
    UserModule,
    ProjectModule,
    TypeOrmModule.forFeature([Assignee]),
  ],
})
export class AllocationModule {}
