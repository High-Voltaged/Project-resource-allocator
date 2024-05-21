import { Resolver, Query, Args, Mutation } from '@nestjs/graphql';
import { UserService } from './user.service';
import { User, UserOutput } from './user.entity';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '~/auth/guards/jwt.guard';
import { UUIDInput } from '~/shared/dto';
import { SkillService } from '~/skills/skill.service';
import {
  ProjectUsersInput,
  ProjectUsersOutput,
  RemoveMySkillsInput,
  UpdateMyProfileInput,
  UpdateMySkillsInput,
  UserSkillOutput,
  UserWithSkillsOutput,
} from './dto/user.dto';
import { ProjectGuard } from '~/auth/guards/associate/project.guard';
import { CurrentUser } from '~/auth/decorators/current_user.decorator';

@UseGuards(JwtAuthGuard)
@Resolver(() => User)
export class UserResolver {
  constructor(
    private readonly userService: UserService,
    private skillService: SkillService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Query(() => UserOutput)
  userById(@Args() { id }: UUIDInput): Promise<UserOutput> {
    return this.userService.findOneById(id);
  }

  @UseGuards(JwtAuthGuard)
  @Query(() => [UserSkillOutput])
  userSkills(@Args() { id }: UUIDInput): Promise<UserSkillOutput[]> {
    return this.skillService.findAllByUserId(id);
  }

  @UseGuards(JwtAuthGuard)
  @Query(() => UserWithSkillsOutput)
  userByIdWithSkills(@Args() { id }: UUIDInput) {
    return this.userService.findOneByIdWithSkills(id);
  }

  @UseGuards(ProjectGuard)
  @Query(() => ProjectUsersOutput)
  projectUsers(@Args() data: ProjectUsersInput): Promise<ProjectUsersOutput> {
    return this.userService.findAllByProjectId(data);
  }

  @UseGuards(JwtAuthGuard)
  @Query(() => UserWithSkillsOutput)
  myProfile(@CurrentUser() { id }: User) {
    return this.userService.findOneByIdWithSkills(id);
  }

  @UseGuards(JwtAuthGuard)
  @Mutation(() => UserOutput)
  updateMyProfile(
    @Args() data: UpdateMyProfileInput,
    @CurrentUser() { id }: User,
  ): Promise<UserOutput> {
    return this.userService.updateUser(id, data);
  }

  @UseGuards(JwtAuthGuard)
  @Mutation(() => Boolean)
  async updateMySkills(
    @Args() { skills }: UpdateMySkillsInput,
    @CurrentUser() { id }: User,
  ) {
    await this.skillService.saveUserSkills(id, skills);
    return true;
  }

  @UseGuards(JwtAuthGuard)
  @Mutation(() => Boolean)
  async removeMySkills(
    @Args() { skillNames }: RemoveMySkillsInput,
    @CurrentUser() user: User,
  ) {
    await this.skillService.removeUserSkills(user.id, skillNames);
    return true;
  }
}
