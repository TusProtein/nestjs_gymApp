import { Module } from '@nestjs/common';
import { MembershipPlanService } from './membership-plan.service';
import { MembershipPlanController } from './membership-plan.controller';

@Module({
  controllers: [MembershipPlanController],
  providers: [MembershipPlanService],
})
export class MembershipPlanModule {}
