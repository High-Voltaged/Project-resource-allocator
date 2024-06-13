import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { User } from '~/users/user.entity';
import { AllocationResolver } from './allocation.resolver';
import { AllocationService } from './allocation.service';
import { Assignee } from '~/tickets/assignee.entity';
import { SkillLevel } from '~/skills/skill.entity';
import { TicketService } from '~/tickets/ticket.service';
import { UserService } from '~/users/user.service';
import { UserSkillOutput } from '~/users/dto/user.dto';
import { ProjectService } from '~/projects/project.service';
import { allocationErrors } from './const/allocation.errors';

describe('AllocationResolver', () => {
  let resolver: AllocationResolver;
  let service: AllocationService;
  let mockTicketService: { findAllUnassigned: jest.Mock };
  let mockUserService: { findAllWithSkillsByProjectId: jest.Mock };

  const skills: UserSkillOutput[] = [
    { level: SkillLevel.Beginner, name: 'node' },
    { level: SkillLevel.Intermediate, name: 'js' },
    { level: SkillLevel.Beginner, name: 'js' },
  ];
  const tickets = [
    { id: '1', title: 'node_ticket', skillLevels: [skills[0]] },
    { id: '2', title: 'js_ticket', skillLevels: [skills[1]] },
  ];

  const user = { id: 'name', skillLevels: [skills[2]], isAvailable: true };

  beforeEach(async () => {
    mockTicketService = {
      findAllUnassigned: jest.fn(() => [...tickets]),
    };

    mockUserService = {
      findAllWithSkillsByProjectId: jest.fn(() => [user]),
    };

    const mockAssigneeRepository: Partial<jest.Mocked<Repository<Assignee>>> = {
      save: jest.fn().mockImplementation((a) => Promise.resolve(a)),
    };

    const mockProjectService = {};

    const moduleRef = await Test.createTestingModule({
      providers: [
        AllocationService,
        AllocationResolver,
        { provide: ProjectService, useValue: mockProjectService },
        { provide: TicketService, useValue: mockTicketService },
        { provide: UserService, useValue: mockUserService },
        {
          provide: getRepositoryToken(Assignee),
          useValue: mockAssigneeRepository,
        },
      ],
    }).compile();

    service = await moduleRef.resolve<AllocationService>(AllocationService);
    resolver = await moduleRef.resolve<AllocationResolver>(AllocationResolver);
  });

  describe('allocateProjectTasks', () => {
    it('should allocate tasks correctly', async () => {
      jest
        .spyOn(mockTicketService, 'findAllUnassigned')
        .mockImplementation(() => [...tickets]);

      const result = await resolver.allocateProjectTasks({ id: '1' } as User, {
        id: '2',
      });

      const allocations = result.allocations;
      expect(allocations[0].user.id).toBe(user.id);
      expect(allocations[0].ticket.title).toBe(tickets[1].title);
    });

    it('should throw an error because of lack of unassigned tickets', async () => {
      jest
        .spyOn(mockTicketService, 'findAllUnassigned')
        .mockImplementation(() => []);

      await expect(
        resolver.allocateProjectTasks({ id: '1' } as User, { id: '2' }),
      ).rejects.toThrow(allocationErrors.NOT_ENOUGH_TICKETS);
    });

    it('should throw an error because of lack of available employees', async () => {
      jest
        .spyOn(mockTicketService, 'findAllUnassigned')
        .mockImplementation(() => [...tickets]);
      jest
        .spyOn(mockUserService, 'findAllWithSkillsByProjectId')
        .mockImplementation(() => []);

      await expect(
        resolver.allocateProjectTasks({ id: '1' } as User, { id: '2' }),
      ).rejects.toThrow(allocationErrors.NOT_ENOUGH_EMPLOYEES);
    });
  });

  afterEach(() => {
    mockTicketService.findAllUnassigned.mockClear();
  });
});
