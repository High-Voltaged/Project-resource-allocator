import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Project } from './project.entity';
import { ProjectService } from './project.service';
import { ProjectUser } from './project_user.entity';
import { ProjectResolver } from './project.resolver';
import { RolesGuard } from '~/auth/guards/roles.guard';

@Module({
  imports: [TypeOrmModule.forFeature([Project, ProjectUser])],
  providers: [ProjectService, ProjectResolver, RolesGuard],
  exports: [ProjectService],
})
export class ProjectModule {}
