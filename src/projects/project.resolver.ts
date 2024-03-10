import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { ProjectService } from './project.service';
import { Project } from './project.entity';
import { CreateProjectInput, UpdateProjectInput } from './dto/project.dto';
import { Roles } from '~/auth/decorators/roles.decorator';
import { UserRole } from '~/users/user.entity';
import { RolesGuard } from '~/auth/guards/roles.guard';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '~/auth/guards/jwt.guard';

@UseGuards(JwtAuthGuard, RolesGuard)
@Resolver(() => Project)
export class ProjectResolver {
  constructor(private readonly projectService: ProjectService) {}

  @Query(() => [Project])
  async projects(): Promise<Project[]> {
    return this.projectService.findAll();
  }

  @Query(() => Project)
  async projectById(@Args('id') id: string): Promise<Project> {
    return this.projectService.findById(id);
  }

  @Roles([UserRole.Admin, UserRole.Manager])
  @Mutation(() => Project)
  async createProject(@Args() data: CreateProjectInput): Promise<Project> {
    return this.projectService.create(data);
  }

  @Roles([UserRole.Admin, UserRole.Manager])
  @Mutation(() => Project)
  async updateProject(@Args() data: UpdateProjectInput): Promise<Project> {
    return this.projectService.update(data);
  }

  @Roles([UserRole.Admin, UserRole.Manager])
  @Mutation(() => Boolean)
  async deleteProject(@Args('id') id: string) {
    await this.projectService.delete(id);
    return true;
  }
}
