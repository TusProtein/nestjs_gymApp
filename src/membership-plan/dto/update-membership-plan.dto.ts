import { PartialType } from '@nestjs/mapped-types';
import { CreateMembershipPlanDto } from './create-membership-plan.dto';
import { IsBoolean, IsOptional } from 'class-validator';

export class UpdateMembershipPlanDto extends PartialType(
  CreateMembershipPlanDto,
) {
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
