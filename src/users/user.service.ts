import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RegisterInput } from '~/auth/dto/auth.dto';
import { User } from './user.entity';
import { SkillService } from '~/skills/skill.service';
import { ProjectUsersInput } from './dto/user.dto';
import { ProjectUser } from '~/projects/project_user.entity';

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

  findByEmail(email: string) {
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
      ])
      .addSelect('pu.role as role')
      .innerJoin(ProjectUser, 'pu', 'pu.user_id = u.id')
      .where('pu.project_id = :projectId', { projectId });

    if (role) {
      qb.andWhere('pu.role = :role', { role });
    }

    return qb.getRawMany();
  }

  async createUser({ skills, ...user }: RegisterInput) {
    const created: User = await this.userRepository.save(user);

    await this.skillService.saveUserSkills(created.id, skills);
  }
}
