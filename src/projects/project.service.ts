import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOneOptions, Repository } from 'typeorm';
import { Project } from './project.entity';
import {
  AddUserToProjectInput,
  CreateProjectInput,
  UpdateProjectInput,
} from './dto/project.dto';
import projectErrors from './project.constants';
import { ProjectUser } from './project_user.entity';
import { UserRole } from '~/users/user.entity';

@Injectable()
export class ProjectService {
  constructor(
    @InjectRepository(Project)
    private projectRepository: Repository<Project>,
    @InjectRepository(ProjectUser)
    private projectUserRepository: Repository<ProjectUser>,
  ) {}

  async findAllByUserId(id: string): Promise<Project[]> {
    return this.projectRepository
      .createQueryBuilder('p')
      .innerJoin(ProjectUser, 'pu', 'pu.project_id = p.id')
      .where('pu.user_id = :id', { id })
      .getMany();
  }

  async findOneById(id: string, options: FindOneOptions<Project> = {}) {
    const found = await this.projectRepository.findOne({
      where: { id },
      ...options,
    });

    if (!found) {
      throw new NotFoundException(projectErrors.NOT_FOUND);
    }

    return found;
  }

  findProjectUser(projectId: string, userId: string) {
    return this.projectUserRepository.findOne({
      where: {
        project: { id: projectId },
        user: { id: userId },
      },
    });
  }

  async create(data: CreateProjectInput, userId: string) {
    const { id } = await this.projectRepository.save(data);
    const project = await this.findOneById(id);

    await this.projectUserRepository.save({
      projectId: id,
      userId,
      role: UserRole.Admin,
    });

    return this.projectRepository.save(project);
  }

  addUserToProject(data: AddUserToProjectInput) {
    return this.projectUserRepository.save(data as ProjectUser);
  }

  async update({ id, ...data }: UpdateProjectInput) {
    await this.projectRepository.update(id, data);
    return this.projectRepository.findOne({ where: { id } });
  }

  async delete(id: string): Promise<void> {
    await this.projectRepository.delete(id);
  }
}
