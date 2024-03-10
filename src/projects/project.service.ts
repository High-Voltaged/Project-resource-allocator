import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Project } from './project.entity';
import { CreateProjectInput, UpdateProjectInput } from './dto/project.dto';
import projectErrors from './project.constants';

@Injectable()
export class ProjectService {
  constructor(
    @InjectRepository(Project)
    private projectRepository: Repository<Project>,
  ) {}

  async findAll(): Promise<Project[]> {
    return this.projectRepository.find();
  }

  async findOneById(id: string) {
    const found = await this.projectRepository.findOne({ where: { id } });

    if (!found) {
      throw new NotFoundException(projectErrors.NOT_FOUND);
    }

    return found;
  }

  async create(data: CreateProjectInput) {
    const project = this.projectRepository.create(data);
    return this.projectRepository.save(project);
  }

  async update({ id, ...data }: UpdateProjectInput) {
    await this.projectRepository.update(id, data);
    return this.projectRepository.findOne({ where: { id } });
  }

  async delete(id: string): Promise<void> {
    await this.projectRepository.delete(id);
  }
}
