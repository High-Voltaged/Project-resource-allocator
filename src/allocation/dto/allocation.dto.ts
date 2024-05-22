import { ArgsType, Field, ObjectType } from '@nestjs/graphql';
import { Ticket } from '~/tickets/ticket.entity';
import { User } from '~/users/user.entity';

@ObjectType()
export class AllocationResult {
  @Field(() => Ticket)
  ticket: Ticket;

  @Field(() => User)
  user: User;
}

@ObjectType()
export class AllocationOutput {
  @Field(() => [String])
  allocationIds: string[];

  @Field(() => [AllocationResult])
  allocations: AllocationResult[];
}

@ArgsType()
export class ConfirmOrCancelAllocationInput {
  @Field()
  confirmed: boolean;

  @Field(() => [String])
  allocationIds: string[];
}
