import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RegisterInput } from '~/auth/dto/auth.dto';
import { User } from './user.entity';
import { SkillService } from '~/skills/skill.service';
import { ProjectUsersInput } from './dto/user.dto';
import { ProjectUser } from '~/projects/project_user.entity';
import { UserSkill } from './user_skill.entity';
import { Skill } from '~/skills/skill.entity';
import authErrors from '~/auth/const/auth.errors';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private skillService: SkillService,
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
      .innerJoin(UserSkill, 'us', 'us.user_id = :id', { id })
      .innerJoinAndMapMany('u.skills', Skill, 's', 'us.skill_id = s.id')
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

  findAllByProjectId({ projectId, role }: ProjectUsersInput) {
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
      .orderBy('pu.role', 'DESC')
      .addOrderBy('u.first_name', 'ASC');

    if (role) {
      qb.andWhere('pu.role = :role', { role });
    }

    return qb.getRawMany();
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
