import { IsInt, IsNotEmpty } from 'class-validator';
import { CreateUserDto } from '~/users/dto/create-user.dto';
import { AssignAdminDto } from './assign-admin.dto';
import { OmitType } from '@nestjs/mapped-types';

export class SuperAdminCreateAdminDto extends OmitType(CreateUserDto, [
  'role',
] as const) {}
// @IsNotEmpty()
// @IsInt()
// gymId!: number;
