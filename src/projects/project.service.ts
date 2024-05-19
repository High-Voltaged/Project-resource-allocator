import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOneOptions, Repository } from 'typeorm';
import { Project } from './project.entity';
import {
  AddUserToProjectInput,
  CreateProjectInput,
  MyProjectsOutput,
  UpdateProjectInput,
} from './dto/project.dto';
import projectErrors from './project.constants';
import { ProjectUser } from './project_user.entity';
import { UserRole } from '~/users/user.entity';
import { UserService } from '~/users/user.service';
import authErrors from '~/auth/const/auth.errors';
import { PaginationArgs } from '~/shared/pagination.dto';

@Injectable()
export class ProjectService {
  constructor(
    @InjectRepository(Project)
    private projectRepository: Repository<Project>,
    @InjectRepository(ProjectUser)
    private projectUserRepository: Repository<ProjectUser>,
    private userService: UserService,
  ) {}

  async findAllByUserId(
    id: string,
    { limit, offset }: PaginationArgs,
  ): Promise<MyProjectsOutput> {
    const qb = this.projectRepository
      .createQueryBuilder('p')
      .select([
        'p.id as id',
        'p.name as name',
        'p.type as type',
        'p.start_at as "startAt"',
        'pu.role as role',
      ])
      .innerJoin(ProjectUser, 'pu', 'pu.project_id = p.id')
      .where('pu.user_id = :id', { id })
      .orderBy('p.start_at', 'DESC');

    const [items, count] = await Promise.all([
      qb.limit(limit).offset(offset).getRawMany(),
      qb.getCount(),
    ]);
    return { items, count };
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

  async findOneByIdWithRole(id: string, userId: string) {
    const found = await this.projectRepository
      .createQueryBuilder('p')
      .select([
        'p.id as id',
        'p.name as name',
        'p.type as type',
        'p.start_at as "startAt"',
        'pu.role as role',
      ])
      .innerJoin(ProjectUser, 'pu', 'pu.project_id = p.id')
      .where('p.id = :id', { id })
      .andWhere('pu.user_id = :userId', { userId })
      .getRawOne();

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

  async addUserToProject(
    currentUserEmail: string,
    data: AddUserToProjectInput,
  ) {
    const { email, ...rest } = data;

    if (currentUserEmail === email) {
      throw new BadRequestException(authErrors.ROLE_MISMATCH);
    }

    const user = await this.userService.findOneByEmail(email);
    if (!user) {
      throw new BadRequestException(authErrors.EMAIL_NOT_FOUND);
    }

    const projectUser = { userId: user.id, ...rest };

    return this.projectUserRepository.save(projectUser as ProjectUser);
  }

  async update({ id, ...data }: UpdateProjectInput) {
    await this.projectRepository.update(id, data);
    return this.projectRepository.findOne({ where: { id } });
  }

  async delete(id: string): Promise<void> {
    await this.projectRepository.manager.transaction(async (entityManager) => {
      await entityManager
        .createQueryBuilder()
        .delete()
        .from(ProjectUser)
        .where('projectId = :id', { id })
        .execute();

      await entityManager
        .createQueryBuilder()
        .delete()
        .from(Project)
        .where('id = :id', { id })
        .execute();
    });
  }
}
