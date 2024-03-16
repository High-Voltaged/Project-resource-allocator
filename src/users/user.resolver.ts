import { Resolver, Query, Args } from '@nestjs/graphql';
import { UserService } from './user.service';
import { User } from './user.entity';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '~/auth/guards/jwt.guard';
import { UUIDInput } from '~/shared/dto';
import { SkillService } from '~/skills/skill.service';
import {
  ProjectUserOutput,
  ProjectUsersInput,
  UserSkillOutput,
  UserWithSkillsOutput,
} from './dto/user.dto';
import { ProjectGuard } from '~/auth/guards/associate/project.guard';

@UseGuards(JwtAuthGuard)
@Resolver(() => User)
export class UserResolver {
  constructor(
    private readonly userService: UserService,
    private skillService: SkillService,
  ) {}

  //! unprotected query
  @Query(() => [UserSkillOutput])
  userSkills(@Args() { id }: UUIDInput): Promise<UserSkillOutput[]> {
    return this.skillService.findAllByUserId(id);
  }

  //! unprotected query
  @Query(() => UserWithSkillsOutput)
  userByIdWithSkills(@Args() { id }: UUIDInput) {
    return this.userService.findOneByIdWithSkills(id);
  }

  @UseGuards(ProjectGuard)
  @Query(() => [ProjectUserOutput])
  projectUsers(@Args() data: ProjectUsersInput) {
    return this.userService.findAllByProjectId(data);
  }
}
