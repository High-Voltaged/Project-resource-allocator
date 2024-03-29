import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOneOptions, Repository } from 'typeorm';
import { Skill, SkillLevel } from './skill.entity';
import skillErrors from './skill.constants';
import { SkillInput, SkillNameInput } from './dto/skill.dto';
import { UserSkill } from '~/users/user_skill.entity';
import { UserSkillOutput } from '~/users/dto/user.dto';
import { TicketSkill } from './ticket_skill.entity';

@Injectable()
export class SkillService {
  constructor(
    @InjectRepository(Skill)
    private skillRepository: Repository<Skill>,
    @InjectRepository(UserSkill)
    private userSkillRepository: Repository<UserSkill>,
    @InjectRepository(TicketSkill)
    private ticketSkillRepository: Repository<TicketSkill>,
  ) {}

  async checkIfSkillExists(id: string) {
    const skill = await this.findOneById(id);
    if (!skill) {
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

  create(data: SkillNameInput): Promise<Skill> {
    return this.skillRepository.save(data);
  }

  private async getSkillId(skill: SkillInput): Promise<string> {
    const { skillId, skillName } = skill;
    if (skillId) {
      await this.checkIfSkillExists(skillId);
    }

    let newSkillId = null;
    if (skillName) {
      ({ id: newSkillId } = await this.create({
        name: skillName,
      }));
    }

    return skillId || newSkillId;
  }

  saveUserSkills(userId: string, skills: SkillInput[]) {
    return Promise.all([
      skills.map(async (s): Promise<UserSkill> => {
        const id = await this.getSkillId(s);

        return this.userSkillRepository.save({
          skill: { id },
          level: s.level,
          user: { id: userId },
        });
      }),
    ]);
  }

  saveTicketSkills(ticketId: string, skills: SkillInput[]) {
    return Promise.all([
      skills.map(async (s): Promise<TicketSkill> => {
        const id = await this.getSkillId(s);

        return this.ticketSkillRepository.save({
          skill: { id },
          level: s.level,
          ticket: { id: ticketId },
        });
      }),
    ]);
  }
}
