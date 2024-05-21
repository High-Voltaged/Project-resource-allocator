import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RegisterInput } from '~/auth/dto/auth.dto';
import { User } from './user.entity';
import { ProjectUsersInput, ProjectUsersOutput } from './dto/user.dto';
import { ProjectUser } from '~/projects/project_user.entity';
import { UserSkill } from './user_skill.entity';
import { Skill } from '~/skills/skill.entity';
import authErrors from '~/auth/const/auth.errors';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  findAll(): Promise<User[]> {
    return this.userRepository.find();
  }

  findOneById(id: string) {
    return this.userRepository.findOne({ where: { id } });
  }

  findOneByIdWithSkills(id: string) {
    return this.userRepository
      .createQueryBuilder('u')
      .select()
      .leftJoin(UserSkill, 'us', 'us.user_id = :id', { id })
      .leftJoinAndMapMany('u.skills', Skill, 's', 'us.skill_id = s.id')
      .where('u.id = :id', { id })
      .getOne();
  }

  findOneByEmail(email: string) {
    return this.userRepository.findOne({
      select: {
        id: true,
        firstName: true,
        lastName: true,
        password: true,
        email: true,
      },
      where: { email },
    });
  }

  async findAllByProjectId({
    projectId,
    role,
    limit,
    offset,
  }: ProjectUsersInput): Promise<ProjectUsersOutput> {
    const qb = this.userRepository
      .createQueryBuilder('u')
      .select([
        'u.id as id',
        'u.first_name as "firstName"',
        'u.last_name as "lastName"',
        'u.email as email',
        'pu.role as role',
      ])
      .innerJoin(ProjectUser, 'pu', 'pu.user_id = u.id')
      .where('pu.project_id = :projectId', { projectId })
      .orderBy('pu.role', 'ASC')
      .addOrderBy('u.first_name', 'ASC');

    if (role) {
      qb.andWhere('pu.role = :role', { role });
    }

    if (limit === 0) {
      const [items, count] = await Promise.all([
        qb.getRawMany(),
        qb.getCount(),
      ]);
      return { items, count };
    }

    const [items, count] = await Promise.all([
      qb.limit(limit).offset(offset).getRawMany(),
      qb.getCount(),
    ]);
    return { items, count };
  }

  async createUser(data: RegisterInput) {
    await this.userRepository.save(data);
  }

  async updateUser(id: string, data: Partial<User>) {
    if (data.email) {
      const found = await this.findOneByEmail(data.email);
      if (found) {
        throw new BadRequestException(authErrors.EMEAIL_EXISTS);
      }
    }

    await this.userRepository.update(id, data);
    return this.findOneById(id);
  }
}
