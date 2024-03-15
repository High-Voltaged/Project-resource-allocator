import { Module, forwardRef } from '@nestjs/common';
import { UserService } from './user.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user.entity';
import { UserSkill } from './user_skill.entity';
import { SkillModule } from '~/skills/skill.module';
import { UserResolver } from './user.resolver';
import { ProjectModule } from '~/projects/project.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, UserSkill]),
    SkillModule,
    forwardRef(() => ProjectModule),
  ],
  providers: [UserService, UserResolver],
  exports: [UserService],
})
export class UserModule {}
