import { IsNotEmpty } from 'class-validator';

export class AssignAdminDto {
  @IsNotEmpty()
  adminId!: number;
}
