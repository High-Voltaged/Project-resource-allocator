import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { ProjectService } from './project.service';
import { Project } from './project.entity';
import {
  AddUserToProjectInput,
  CreateProjectInput,
  MyProject,
  MyProjectsOutput,
  UpdateProjectInput,
} from './dto/project.dto';
import { Roles } from '~/auth/decorators/roles.decorator';
import { User, UserRole } from '~/users/user.entity';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '~/auth/guards/jwt.guard';
import { UUIDInput } from '~/shared/dto';
import { ProjectGuard } from '~/auth/guards/associate/project.guard';
import { CurrentUser } from '~/auth/decorators/current_user.decorator';
import { PaginationArgs } from '~/shared/pagination.dto';

@UseGuards(JwtAuthGuard)
@Resolver(() => Project)
export class ProjectResolver {
  constructor(private readonly projectService: ProjectService) {}

  @UseGuards(JwtAuthGuard)
  @Query(() => MyProjectsOutput)
  myProjects(
    @CurrentUser() user: User,
    @Args() args: PaginationArgs,
  ): Promise<MyProjectsOutput> {
    return this.projectService.findAllByUserId(user.id, args);
  }

  @UseGuards(ProjectGuard)
  @Query(() => MyProject)
  projectById(
    @CurrentUser() user: User,
    @Args() { id }: UUIDInput,
  ): Promise<MyProject> {
    return this.projectService.findOneByIdWithRole(id, user.id);
  }

  @Mutation(() => Project)
  createProject(
    @CurrentUser() user: User,
    @Args() data: CreateProjectInput,
  ): Promise<Project> {
    return this.projectService.create(data, user.id);
  }

  @UseGuards(ProjectGuard)
  @Roles([UserRole.Admin, UserRole.Manager])
  @Mutation(() => Boolean)
  async addUserToProject(
    @CurrentUser() user: User,
    @Args() data: AddUserToProjectInput,
  ) {
    await this.projectService.addUserToProject(user.email, data);
    return true;
  }

  @UseGuards(ProjectGuard)
  @Roles([UserRole.Admin, UserRole.Manager])
  @Mutation(() => Project)
  updateProject(@Args() data: UpdateProjectInput): Promise<Project> {
    return this.projectService.update(data);
  }

  @UseGuards(ProjectGuard)
  @Roles([UserRole.Admin])
  @Mutation(() => Boolean)
  async deleteProject(@Args() { id }: UUIDInput) {
    await this.projectService.delete(id);
    return true;
  }
}
