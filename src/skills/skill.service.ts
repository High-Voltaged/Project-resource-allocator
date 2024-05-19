import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOneOptions, Repository } from 'typeorm';
import { Skill, SkillLevel } from './skill.entity';
import skillErrors from './skill.constants';
import { SkillInput, SkillNameInput } from './dto/skill.dto';
import { UserSkill } from '~/users/user_skill.entity';
import { UserSkillOutput } from '~/users/dto/user.dto';
import { TicketSkill } from '../tickets/ticket_skill.entity';

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

  // async checkIfSkillExists(id: string) {
  //   const skill = await this.findOneById(id);
  //   if (!skill) {
  //     throw new NotFoundException(skillErrors.NOT_FOUND);
  //   }
  // }

  // findOneById(id: string, options: FindOneOptions<Skill> = {}) {
  //   return this.skillRepository.findOne({ where: { id }, ...options });
  // }

  findOneByName(name: string, options: FindOneOptions<Skill> = {}) {
    return this.skillRepository.findOne({ where: { name }, ...options });
  }

  findAll() {
    return this.skillRepository.find();
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

  private async getSkillId(name: string): Promise<string> {
    const found = await this.findOneByName(name);

    if (found) {
      return found.id;
    }

    const newSkill = await this.create({ name });
    return newSkill.id;
  }

  saveUserSkills(userId: string, skills: SkillInput[]) {
    return Promise.all(
      skills.map(async (s): Promise<UserSkill> => {
        const id = await this.getSkillId(s.name);

        return this.userSkillRepository.save({
          skill: { id },
          level: s.level,
          user: { id: userId },
        });
      }),
    );
  }

  saveTicketSkills(ticketId: string, skills: SkillInput[]) {
    return Promise.all(
      skills.map(async (s): Promise<TicketSkill> => {
        const id = await this.getSkillId(s.name);

        return this.ticketSkillRepository.save({
          skill: { id },
          level: s.level,
          ticket: { id: ticketId },
        });
      }),
    );
  }
}
