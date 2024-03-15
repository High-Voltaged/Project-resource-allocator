import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOneOptions, Repository } from 'typeorm';
import { Skill } from './skill.entity';
import skillErrors from './skill.constants';
import { SkillNameDto } from './dto/skill.dto';
import { UserSkill } from '~/users/user_skill.entity';
import { UserSkillInput, UserSkillOutput } from '~/users/dto/user.dto';

@Injectable()
export class SkillService {
  constructor(
    @InjectRepository(Skill)
    private skillRepository: Repository<Skill>,
    @InjectRepository(UserSkill)
    private userSkillRepository: Repository<UserSkill>,
  ) {}

  async checkIfSkillExists(id: string) {
    const ticket = await this.findOneById(id);
    if (!ticket) {
      throw new NotFoundException(skillErrors.NOT_FOUND);
    }
  }

  findOneById(id: string, options: FindOneOptions<Skill> = {}) {
    return this.skillRepository.findOne({ where: { id }, ...options });
  }

  async findAllByUserId(id: string): Promise<UserSkillOutput[]> {
    return this.skillRepository
      .createQueryBuilder('s')
      .select(['s.name as name, us.level as level'])
      .innerJoin(UserSkill, 'us', 'us.skill_id = s.id')
      .where('us.user_id = :id', { id })
      .getRawMany();
  }

  create(data: SkillNameDto): Promise<Skill> {
    return this.skillRepository.save(data);
  }

  saveUserSkills(userId: string, skills: UserSkillInput[]) {
    return Promise.all([
      skills.map(async (skill): Promise<UserSkill> => {
        const { level, skillId, skillName } = skill;
        if (skillId) {
          await this.checkIfSkillExists(skillId);
        }

        let newSkillId = null;
        if (skillName) {
          ({ id: newSkillId } = await this.create({
            name: skillName,
          }));
        }

        return this.userSkillRepository.save({
          level,
          user: { id: userId },
          skill: { id: skillId || newSkillId },
        });
      }),
    ]);
  }
}
