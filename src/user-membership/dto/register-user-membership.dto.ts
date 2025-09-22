import { IsInt } from 'class-validator';

export class RegisterUserMembershipDto {
  @IsInt({ message: 'planId phải là số nguyên' })
  planId!: number;
}
