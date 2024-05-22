import { Resolver, Mutation, Args } from '@nestjs/graphql';
import { AllocationService } from './allocation.service';
import { UseGuards } from '@nestjs/common';
import { Roles } from '~/auth/decorators/roles.decorator';
import { ProjectGuard } from '~/auth/guards/associate/project.guard';
import { UUIDInput } from '~/shared/dto';
import { User, UserRole } from '~/users/user.entity';
import { CurrentUser } from '~/auth/decorators/current_user.decorator';
import {
  AllocationOutput,
  ConfirmOrCancelAllocationInput,
} from './dto/allocation.dto';
import { JwtAuthGuard } from '~/auth/guards/jwt.guard';

@Resolver()
export class AllocationResolver {
  constructor(private readonly allocationService: AllocationService) {}

  @UseGuards(JwtAuthGuard, ProjectGuard)
  @Roles([UserRole.Manager, UserRole.Admin])
  @Mutation(() => AllocationOutput)
  async allocateProjectTasks(
    @CurrentUser() user: User,
    @Args() { id }: UUIDInput,
  ): Promise<AllocationOutput> {
    await this.allocationService.initialize(id);

    const matrix = this.allocationService.getCostMatrix();

    const allocations = this.allocationService.hungarianAlgorithm(matrix);

    const allocationIds = await this.allocationService.saveAllocationResults(
      allocations,
      user.id,
    );

    return { allocationIds, allocations };
  }

  @UseGuards(JwtAuthGuard, ProjectGuard)
  @Roles([UserRole.Manager, UserRole.Admin])
  @Mutation(() => Boolean)
  async confirmOrCancelAllocation(
    @Args() { confirmed, allocationIds }: ConfirmOrCancelAllocationInput,
  ): Promise<Boolean> {
    confirmed
      ? this.allocationService.confirmAllocation(allocationIds)
      : this.allocationService.cancelAllocation(allocationIds);

    return true;
  }
}
