import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Project } from './project.entity';
import { ProjectService } from './project.service';
import { ProjectResolver } from './project.resolver';
import { UserModule } from '~/users/user.module';
import { ProjectUser } from './project_user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Project, ProjectUser]),
    forwardRef(() => UserModule),
  ],
  providers: [ProjectService, ProjectResolver],
  exports: [ProjectService],
})
export class ProjectModule {}
