import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { ProjectService } from './project.service';
import { Project } from './project.entity';
import {
  AddUserToProjectInput,
  CreateProjectInput,
  UpdateProjectInput,
} from './dto/project.dto';
import { Roles } from '~/auth/decorators/roles.decorator';
import { User, UserRole } from '~/users/user.entity';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '~/auth/guards/jwt.guard';
import { UUIDInput } from '~/shared/dto';
import { ProjectGuard } from '~/auth/guards/associate/project.guard';
import { CurrentUser } from '~/auth/decorators/current_user.decorator';

@UseGuards(JwtAuthGuard)
@Resolver(() => Project)
export class ProjectResolver {
  constructor(private readonly projectService: ProjectService) {}

  @Query(() => [Project])
  projectsByUserId(@CurrentUser() user: User): Promise<Project[]> {
    return this.projectService.findAllByUserId(user.id);
  }

  @UseGuards(ProjectGuard)
  @Query(() => Project)
  projectById(@Args() { id }: UUIDInput): Promise<Project> {
    return this.projectService.findOneById(id);
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
  async addUserToProject(@Args() data: AddUserToProjectInput) {
    await this.projectService.addUserToProject(data);
    return true;
  }

  @UseGuards(ProjectGuard)
  @Roles([UserRole.Admin, UserRole.Manager])
  @Mutation(() => Project)
  updateProject(@Args() data: UpdateProjectInput): Promise<Project> {
    return this.projectService.update(data);
  }

  @UseGuards(ProjectGuard)
  @Roles([UserRole.Admin, UserRole.Manager])
  @Mutation(() => Boolean)
  async deleteProject(@Args() { id }: UUIDInput) {
    await this.projectService.delete(id);
    return true;
  }
}

// 1. remove user role
// 2. add user/project role
// 3. add admin role by default when creating a project
// 4. update all the user/project queries / mutations
// 5. create a connection between a user and a project
// 6. modify the role guard to consider the role the user has for this project
