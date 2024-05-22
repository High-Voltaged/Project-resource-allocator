import { BadRequestException, Injectable, Scope } from '@nestjs/common';
import { DEFAULT_PAD_VALUE } from './const/allocation.constants';
import { User, UserRole } from '~/users/user.entity';
import { Ticket } from '~/tickets/ticket.entity';
import { UserService } from '~/users/user.service';
import { allocationErrors } from './const/allocation.errors';
import { TicketService } from '~/tickets/ticket.service';
import { AllocationResult } from './dto/allocation.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Assignee } from '~/tickets/assignee.entity';
import { Repository } from 'typeorm';

@Injectable({ scope: Scope.REQUEST })
export class AllocationService {
  private developers: User[];
  private tickets: Ticket[];

  constructor(
    private readonly ticketService: TicketService,
    private readonly userService: UserService,
    @InjectRepository(Assignee)
    private assigneeRepository: Repository<Assignee>,
  ) {
    this.developers = [];
    this.tickets = [];
  }

  setDevelopers(developers: User[]) {
    this.developers = developers;
  }

  setTickets(tickets: Ticket[]) {
    this.tickets = tickets;
  }

  async initialize(projectId: string) {
    const tickets = await this.ticketService.findAllUnassigned(projectId);

    if (!tickets.length) {
      throw new BadRequestException(allocationErrors.NOT_ENOUGH_TICKETS);
    }

    this.setTickets(tickets);

    const users = await this.userService.findAllWithSkillsByProjectId({
      projectId,
      role: UserRole.Employee,
    });

    if (!users.length) {
      throw new BadRequestException(allocationErrors.NOT_ENOUGH_EMPLOYEES);
    }

    this.setDevelopers(users);
  }

  padMatrix(matrix: number[][]) {
    let max_columns = 0;
    let total_rows = matrix.length;

    for (let i = 0; i < total_rows; ++i) {
      if (matrix[i].length > max_columns) {
        max_columns = matrix[i].length;
      }
    }

    total_rows = max_columns > total_rows ? max_columns : total_rows;

    let new_matrix = [];

    for (let i = 0; i < total_rows; ++i) {
      let row = matrix[i] || [];
      let new_row = row.slice();

      while (total_rows > new_row.length) {
        new_row.push(DEFAULT_PAD_VALUE);
      }

      new_matrix.push(new_row);
    }

    return new_matrix;
  }

  getCostMatrix(): number[][] {
    const profitMatrix: number[][] = [];

    for (let i = 0; i < this.developers.length; i++) {
      const developer = this.developers[i];
      const developerSkills = developer.skillLevels.reduce((acc, s) => {
        acc[s.name] = s.level;
        return acc;
      }, {});

      const row: number[] = [];

      for (let j = 0; j < this.tickets.length; j++) {
        const task = this.tickets[j];
        let profit = 0;

        const requiredSkills: { [key: string]: number } =
          task.skillLevels.reduce((acc, s) => {
            acc[s.name] = s.level;
            return acc;
          }, {});

        const totalRequiredSkillLevel = Object.values(requiredSkills).reduce(
          (a, b) => a + b,
          0,
        );

        const possessedSkillLevel = Object.keys(requiredSkills)
          .filter((skill) => developerSkills.hasOwnProperty(skill))
          .reduce((acc, skill) => {
            return (
              acc + Math.min(developerSkills[skill], requiredSkills[skill])
            );
          }, 0);

        const skillPercentage =
          (possessedSkillLevel / totalRequiredSkillLevel) * 100;

        profit = skillPercentage * (developer.isAvailable ? 1 : 0);

        row.push(profit);
      }

      profitMatrix.push(row);
    }

    const paddedMatrix = this.padMatrix(profitMatrix);

    const maxValue = Math.max(...paddedMatrix.flat());
    const inverseValues = (x) => maxValue - x;
    const costMatrix = paddedMatrix.map((row) => row.map(inverseValues));

    return costMatrix;
  }

  clearCovers(rows: boolean[], cols: boolean[]) {
    rows.fill(false);
    cols.fill(false);
  }

  createMatrix(size: number): number[][] {
    return Array(size)
      .fill(null)
      .map(() => Array(size).fill(0));
  }

  findZero(
    costMatrix: number[][],
    rowsCovered: boolean[],
    colsCovered: boolean[],
  ) {
    for (let i = 0; i < costMatrix.length; ++i)
      for (let j = 0; j < costMatrix[0].length; ++j)
        if (costMatrix[i][j] === 0 && !rowsCovered[i] && !colsCovered[j]) {
          return [i, j];
        }

    return [-1, -1];
  }

  findRowStar(zeros: number[][], row: number) {
    for (let i = 0; i < zeros.length; ++i) {
      if (zeros[row][i] === 1) {
        return i;
      }
    }
    return -1;
  }

  findColStar(zeros: number[][], col: number) {
    for (let i = 0; i < zeros.length; ++i) {
      if (zeros[i][col] === 1) {
        return i;
      }
    }
    return -1;
  }

  findRowPrime(zeros: number[][], row: number) {
    for (let i = 0; i < zeros.length; ++i) {
      if (zeros[row][i] === 2) {
        return i;
      }
    }
    return -1;
  }

  findSmallest(
    costMatrix: number[][],
    rowsCovered: boolean[],
    colsCovered: boolean[],
  ) {
    let min = Number.MAX_VALUE;

    for (let i = 0; i < costMatrix.length; ++i)
      for (let j = 0; j < costMatrix[0].length; ++j) {
        if (!rowsCovered[i] && !colsCovered[j] && min > costMatrix[i][j]) {
          min = costMatrix[i][j];
        }
      }

    return min;
  }

  convertPath(zeros: number[][], path: number[][], count: number) {
    for (let i = 0; i <= count; i++) {
      const row = path[i][0];
      const col = path[i][1];

      zeros[row][col] = zeros[row][col] == 1 ? 0 : 1;
    }
  }

  clearPrimes(costMatrix: number[][], zeros: number[][]) {
    for (let i = 0; i < costMatrix.length; ++i) {
      for (let j = 0; j < costMatrix.length; ++j) {
        if (zeros[i][j] == 2) {
          zeros[i][j] = 0;
        }
      }
    }
  }

  getAllocations(assignments: number[][]): AllocationResult[] {
    const allocations: AllocationResult[] = [];
    for (const [developerIndex, ticketIndex] of assignments) {
      const user = this.developers[developerIndex];
      const ticket = this.tickets[ticketIndex];

      allocations.push({ user, ticket });
    }
    return allocations;
  }

  hungarianAlgorithm(costMatrix: number[][]): AllocationResult[] {
    const numRows = costMatrix.length;
    const numCols = costMatrix[0].length;
    const self = this;

    const rowsCovered = new Array(numRows).fill(false);
    const colsCovered = new Array(numCols).fill(false);
    let zeros = this.createMatrix(numRows);
    let path = this.createMatrix(numRows * 2);
    let Z0_row = 0;
    let Z0_col = 0;

    function step1() {
      for (let i = 0; i < costMatrix.length; i++) {
        const minRowValue = Math.min(...costMatrix[i]);
        for (let j = 0; j < costMatrix[0].length; j++) {
          costMatrix[i][j] -= minRowValue;
        }
      }

      return 2;
    }

    function step2() {
      for (let i = 0; i < costMatrix.length; i++) {
        for (let j = 0; j < costMatrix[0].length; j++) {
          if (costMatrix[i][j] === 0 && !rowsCovered[i] && !colsCovered[j]) {
            zeros[i][j] = 1;
            colsCovered[j] = true;
            rowsCovered[i] = true;
            break;
          }
        }
      }

      self.clearCovers(rowsCovered, colsCovered);

      return 3;
    }

    function step3() {
      let count = 0;

      for (let i = 0; i < costMatrix.length; ++i) {
        for (let j = 0; j < costMatrix[0].length; ++j) {
          if (zeros[i][j] == 1 && !colsCovered[j]) {
            colsCovered[j] = true;
            ++count;
          }
        }
      }

      return count >= costMatrix.length ? 7 : 4;
    }

    function step4() {
      let row = -1;
      let col = -1;
      let starCol = -1;

      while (true) {
        [row, col] = self.findZero(costMatrix, rowsCovered, colsCovered);

        if (row < 0) return 6;

        zeros[row][col] = 2;
        starCol = self.findRowStar(zeros, row);
        if (starCol >= 0) {
          col = starCol;
          rowsCovered[row] = true;
          colsCovered[col] = false;
        } else {
          Z0_row = row;
          Z0_col = col;
          return 5;
        }
      }
    }

    function step5() {
      let count = 0;

      path[count][0] = Z0_row;
      path[count][1] = Z0_col;

      while (true) {
        const row = self.findColStar(zeros, path[count][1]);
        if (row >= 0) {
          count++;
          path[count][0] = row;
          path[count][1] = path[count - 1][1];
        } else {
          break;
        }

        const col = self.findRowPrime(zeros, path[count][0]);
        count++;
        path[count][0] = path[count - 1][0];
        path[count][1] = col;
      }

      self.convertPath(zeros, path, count);
      self.clearCovers(rowsCovered, colsCovered);
      self.clearPrimes(costMatrix, zeros);

      return 3;
    }

    function step6() {
      const minValue = self.findSmallest(costMatrix, rowsCovered, colsCovered);

      for (let i = 0; i < costMatrix.length; ++i) {
        for (let j = 0; j < costMatrix.length; ++j) {
          if (rowsCovered[i]) costMatrix[i][j] += minValue;

          if (!colsCovered[j]) costMatrix[i][j] -= minValue;
        }
      }

      return 4;
    }

    const STEPS = {
      1: step1,
      2: step2,
      3: step3,
      4: step4,
      5: step5,
      6: step6,
    };

    let stepNum = 1;
    while (true) {
      const step = STEPS[stepNum];
      if (!step) break;

      stepNum = step();
    }

    const assignments: [number, number][] = [];

    for (var i = 0; i < this.developers.length; ++i) {
      for (var j = 0; j < this.tickets.length; ++j) {
        if (zeros[i][j] == 1) {
          assignments.push([i, j]);
        }
      }
    }

    return this.getAllocations(assignments);
  }

  async saveAllocationResults(
    results: AllocationResult[],
    allocatorId: string,
  ): Promise<string[]> {
    const saved = await Promise.all(
      results.map(({ ticket, user }) =>
        this.assigneeRepository.save({
          ticketId: ticket.id,
          userId: user.id,
          allocatorId,
          isConfirmed: false,
        }),
      ),
    );

    return (saved || []).map((a) => a.allocationId);
  }

  confirmAllocation(allocationIds: string[]) {
    return this.assigneeRepository
      .createQueryBuilder()
      .update()
      .set({ isConfirmed: true })
      .where('allocation_id IN (:...allocationIds)', { allocationIds })
      .execute();
  }

  cancelAllocation(allocationIds: string[]) {
    return this.assigneeRepository
      .createQueryBuilder('')
      .delete()
      .where('allocation_id IN (:...allocationIds)', { allocationIds })
      .execute();
  }
}
