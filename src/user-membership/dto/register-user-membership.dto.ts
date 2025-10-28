import { IsInt, IsOptional } from 'class-validator';

export class RegisterUserMembershipDto {
  @IsInt({ message: 'planId phải là số nguyên' })
  planId!: number;

  @IsOptional()
  @IsInt({ message: 'ptId phải là số nguyên' })
  ptId?: number;
}
